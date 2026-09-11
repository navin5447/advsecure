from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class PredictionRequest(BaseModel):
    """Request for prediction"""
    data: List[float]
    model: str = "xgboost"  # xgboost or dnn

class PredictionResponse(BaseModel):
    """Response for prediction"""
    prediction: int
    confidence: float
    probability: float
    risk_score: float
    threat_level: str
    inference_time: float
    model_used: str
    timestamp: str

class AttackSimulationRequest(BaseModel):
    """Request for adversarial attack simulation"""
    data: List[List[float]]
    epsilon: float = 0.1
    attack_type: str = "fgsm"
    labels: Optional[List[int]] = None

class AttackSimulationResponse(BaseModel):
    """Response for attack simulation"""
    original_accuracy: float
    adversarial_accuracy: float
    accuracy_loss: float
    prediction_changes: int
    avg_confidence_drop: float
    feature_changes_count: int
    timestamp: str

class DashboardMetrics(BaseModel):
    """Dashboard metrics"""
    total_predictions: int
    normal_traffic: int
    attack_traffic: int
    model_accuracy: float
    model_health: str
    avg_confidence: float
    high_risk_alerts: int
    threat_distribution: Dict[str, int]

class AnalyticsMetrics(BaseModel):
    """Analytics metrics"""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: Dict[str, int]
    feature_importance: Dict[str, float]
    threat_distribution: Dict[str, int]

class ModelInfo(BaseModel):
    """Model information"""
    model_name: str
    version: str
    accuracy: float
    training_date: str
    model_type: str
    status: str

class AuditLog(BaseModel):
    """Audit log entry"""
    id: int
    action: str
    status: str
    timestamp: str
    details: Optional[str] = None

class PredictionLog(BaseModel):
    """Prediction log entry"""
    id: int
    timestamp: str
    model_name: str
    prediction: int
    confidence: float
    probability: float
    risk_score: float
    threat_level: str
    latency: float
