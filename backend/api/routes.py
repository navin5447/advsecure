from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import logging
from io import StringIO
import time
from pathlib import Path
from functools import lru_cache

from schemas.schemas import (
    PredictionRequest, PredictionResponse, AttackSimulationRequest,
    AttackSimulationResponse, DashboardMetrics, AnalyticsMetrics, ModelInfo
)
from services.prediction_service import PredictionService, ThreatIntelligenceService
from services.adversarial_service import AdversarialAttackService
from database.db_service import DatabaseService
from models.model_manager import get_model_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["core"])


@lru_cache(maxsize=1)
def _baseline_dashboard_metrics():
    """Compute a one-time dashboard baseline from the bundled sample dataset."""
    dataset_path = Path(__file__).resolve().parents[1] / "datasets" / "sample_traffic.csv"
    if not dataset_path.exists():
        return None

    manager = get_model_manager()
    if not manager.is_ready():
        return None

    df = pd.read_csv(dataset_path)
    if "Label" not in df.columns:
        return None

    X = df.drop(columns=["Label"]).to_numpy(dtype=float)
    y_true = df["Label"].astype(str).str.lower().map(lambda value: 1 if value == "attack" else 0).to_numpy()

    # Use the same model the UI defaults to for a meaningful baseline.
    X_scaled = manager.scale_input(X)
    predictions, probabilities = manager.predict_xgboost(X_scaled)

    total_predictions = int(len(predictions))
    normal = int(np.sum(predictions == 0))
    attack = int(np.sum(predictions == 1))
    avg_confidence = float(np.mean(np.abs(probabilities - 0.5) * 2)) if len(probabilities) else 0.0

    threat_distribution = {}
    for prediction in predictions:
        key = 'LOW' if int(prediction) == 0 else 'HIGH'
        threat_distribution[key] = threat_distribution.get(key, 0) + 1

    model_accuracy = float(np.mean(predictions == y_true)) if len(y_true) else 0.0

    return {
        "total_predictions": total_predictions,
        "normal": normal,
        "attack": attack,
        "avg_confidence": round(avg_confidence, 4),
        "threat_distribution": threat_distribution,
        "model_accuracy": model_accuracy,
    }

@router.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Predict whether traffic is normal or attack
    """
    try:
        # Convert to numpy array
        X = np.array([request.data])
        
        # Make prediction
        result = PredictionService.predict(X, model_name=request.model)
        
        return PredictionResponse(**result)
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/predict/csv")
async def predict_csv(file: UploadFile = File(...), model: str = "xgboost"):
    """
    Predict on CSV file
    """
    try:
        contents = await file.read()
        df = pd.read_csv(StringIO(contents.decode()))
        
        # Extract features (exclude label column if present)
        feature_cols = [col for col in df.columns if col.lower() not in ['label', 'class', 'target']]
        X = df[feature_cols].values
        
        # Scale
        manager = get_model_manager()
        X_scaled = manager.scale_input(X)
        
        predictions = []
        for i, sample in enumerate(X_scaled):
            result = PredictionService.predict(sample, model_name=model)
            predictions.append(result)
        
        return JSONResponse({
            "status": "success",
            "total_samples": len(predictions),
            "predictions": predictions
        })
    
    except Exception as e:
        logger.error(f"CSV prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/attack")
async def attack(request: AttackSimulationRequest):
    """
    Simulate adversarial attack
    """
    try:
        X = np.array(request.data)
        
        if request.labels is not None and len(request.labels) == len(X):
            y = np.array(request.labels, dtype=float)
        else:
            # Fallback to the original demo assumption if labels were not supplied.
            y = np.ones(len(X))
        
        # Determine which model to attack
        if request.attack_type.lower() == "xgboost":
            result = AdversarialAttackService.attack_xgboost(X, y, epsilon=request.epsilon)
        elif request.attack_type.lower() == "dnn":
            result = AdversarialAttackService.attack_dnn(X, y, epsilon=request.epsilon)
        else:
            raise ValueError(f"Unknown attack type: {request.attack_type}")
        
        return JSONResponse(result)
    
    except Exception as e:
        logger.error(f"Attack error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/dashboard")
async def dashboard():
    """
    Get dashboard metrics
    """
    try:
        stats = DatabaseService.get_stats()
        if stats["total_predictions"] == 0:
            baseline = _baseline_dashboard_metrics()
            if baseline:
                stats = baseline
        
        models = DatabaseService.get_model_info()
        model_accuracy = models[0]['accuracy'] if models else stats.get('model_accuracy', 0.0)
        
        metrics = DashboardMetrics(
            total_predictions=stats['total_predictions'],
            normal_traffic=stats['normal'],
            attack_traffic=stats['attack'],
            model_accuracy=model_accuracy,
            model_health="Healthy" if model_accuracy > 0.85 else "Degraded",
            avg_confidence=stats['avg_confidence'],
            high_risk_alerts=stats['attack'],
            threat_distribution=stats['threat_distribution']
        )
        
        return metrics
    
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def analytics():
    """
    Get analytics metrics
    """
    try:
        models = DatabaseService.get_model_info()
        
        if not models:
            raise HTTPException(status_code=404, detail="No models found")
        
        # Use first model (XGBoost typically)
        model = models[0]
        
        metrics = AnalyticsMetrics(
            accuracy=model['accuracy'],
            precision=model['precision'],
            recall=model['recall'],
            f1_score=model['f1_score'],
            roc_auc=0.92,  # Would be calculated from predictions
            confusion_matrix={"TP": 800, "FP": 50, "TN": 150, "FN": 10},
            feature_importance={f"Feature_{i}": np.random.random() for i in range(10)},
            threat_distribution={}
        )
        
        return metrics
    
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_logs(limit: int = 100):
    """
    Get prediction and audit logs
    """
    try:
        predictions = DatabaseService.get_predictions(limit)
        attacks = DatabaseService.get_attack_logs(limit)
        audits = DatabaseService.get_audit_logs(limit)
        
        return JSONResponse({
            "predictions": predictions,
            "attacks": attacks,
            "audits": audits
        })
    
    except Exception as e:
        logger.error(f"Logs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def get_models():
    """
    Get available models
    """
    try:
        models = DatabaseService.get_model_info()
        
        model_list = []
        for model in models:
            model_list.append({
                "model_name": model['model_name'],
                "version": model['version'],
                "accuracy": model['accuracy'],
                "training_date": model['training_date'],
                "model_type": "XGBoost" if model['model_name'] == "XGBoost" else "Deep Neural Network",
                "status": model['status']
            })
        
        return model_list
    
    except Exception as e:
        logger.error(f"Models error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sample/traffic")
async def sample_traffic(label: str = "Attack"):
    """Return a representative traffic sample from the bundled dataset."""
    try:
        dataset_path = Path(__file__).resolve().parents[1] / "datasets" / "sample_traffic.csv"
        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail="Sample dataset not found")

        df = pd.read_csv(dataset_path)
        label_column = "Label" if "Label" in df.columns else df.columns[-1]
        target = df[df[label_column].astype(str).str.lower() == label.lower()]
        if target.empty:
            target = df

        row = target.iloc[0]
        features = row.drop(labels=[label_column]).tolist()

        return JSONResponse({
            "label": str(row[label_column]),
            "features": [float(value) for value in features],
            "feature_count": len(features),
            "source_index": int(target.index[0]),
            "source_file": str(dataset_path.name),
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Sample traffic error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sample/traffic-batch")
async def sample_traffic_batch(limit: int = 25):
    """Return a batch of model-scored traffic samples from the bundled dataset."""
    try:
        dataset_path = Path(__file__).resolve().parents[1] / "datasets" / "sample_traffic.csv"
        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail="Sample dataset not found")

        manager = get_model_manager()
        if not manager.is_ready():
            raise HTTPException(status_code=503, detail="Models are not ready")

        df = pd.read_csv(dataset_path)
        if "Label" not in df.columns:
            raise HTTPException(status_code=500, detail="Sample dataset is missing the Label column")

        label_column = "Label"

        features = df.drop(columns=[label_column]).to_numpy(dtype=float)
        scaled = manager.scale_input(features)
        predictions, probabilities = manager.predict_xgboost(scaled)

        rows = []
        for index, (_, row) in enumerate(df.head(limit).iterrows()):
            feature_values = [float(value) for value in row.drop(labels=[label_column]).tolist()]
            prediction = int(predictions[index])
            probability = float(probabilities[index])
            rows.append({
                "id": index + 1,
                "Flow_Duration": round(float(row.iloc[0]), 3),
                "Protocol": "TCP",
                "Source_Port": int(abs(float(row.iloc[2])) % 65535),
                "Destination_Port": int(abs(float(row.iloc[3])) % 65535),
                "Packet_Length": int(abs(float(row.iloc[4])) if len(row) > 4 else 0),
                "Bytes": int(abs(float(row.iloc[5])) if len(row) > 5 else 0),
                "Prediction_Status": "Attack" if prediction == 1 else "Normal",
                "threat_level": "HIGH" if prediction == 1 else "LOW",
                "risk_score": round(probability * 100 if prediction == 1 else (1 - probability) * 100, 2),
                "confidence": round(abs(probability - 0.5) * 2, 4),
                "actual_label": str(row.iloc[-1]),
                "features": feature_values,
            })

        return JSONResponse({
            "source_file": str(dataset_path.name),
            "count": len(rows),
            "rows": rows,
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Sample traffic batch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health():
    """
    Health check endpoint
    """
    manager = get_model_manager()
    
    return JSONResponse({
        "status": "healthy" if manager.is_ready() else "degraded",
        "models_loaded": manager.is_ready(),
        "timestamp": pd.Timestamp.now().isoformat()
    })
