import numpy as np
import logging
import time
from typing import Dict, Any
from models.model_manager import get_model_manager
from database.db_service import DatabaseService
from datetime import datetime

logger = logging.getLogger(__name__)

class PredictionService:
    """Service for making predictions"""
    
    THREAT_LEVELS = {
        "LOW": (0, 0.3),
        "MEDIUM": (0.3, 0.7),
        "HIGH": (0.7, 1.0)
    }
    
    @staticmethod
    def calculate_threat_level(confidence: float) -> str:
        """Calculate threat level based on confidence"""
        for level, (low, high) in PredictionService.THREAT_LEVELS.items():
            if low <= confidence <= high:
                return level
        return "UNKNOWN"
    
    @staticmethod
    def predict(
        data: np.ndarray,
        model_name: str = "xgboost"
    ) -> Dict[str, Any]:
        """
        Make prediction on input data
        
        Args:
            data: Input features (should be scaled)
            model_name: Either 'xgboost' or 'dnn'
        
        Returns:
            Prediction result dictionary
        """
        start_time = time.time()
        
        try:
            data = np.asarray(data, dtype=float)
            manager = get_model_manager()
            
            if not manager.is_ready():
                raise RuntimeError("Models not loaded")
            
            # Ensure data is 2D
            if len(data.shape) == 1:
                data = data.reshape(1, -1)

            expected_features = len(manager.feature_columns or [])
            if expected_features and data.shape[1] != expected_features:
                raise ValueError(
                    f"Expected {expected_features} features, received {data.shape[1]}. "
                    f"Please send a 52-feature sample in the model's feature order."
                )
            
            # Scale input
            data_scaled = manager.scale_input(data)
            
            # Make prediction
            if model_name.lower() == "xgboost":
                predictions, probabilities = manager.predict_xgboost(data_scaled)
            elif model_name.lower() == "dnn":
                predictions, probabilities = manager.predict_dnn(data_scaled)
            else:
                raise ValueError(f"Unknown model: {model_name}")
            
            # Use first prediction if batch
            prediction = int(predictions[0])
            probability = float(probabilities[0])
            confidence = abs(probability - (1 - probability)) if probability != 0.5 else 0.0
            
            # Calculate risk score
            if prediction == 1:  # Attack
                risk_score = probability * 100
            else:  # Normal
                risk_score = (1 - probability) * 100
            
            threat_level = PredictionService.calculate_threat_level(probability)
            
            inference_time = time.time() - start_time
            
            result = {
                "prediction": prediction,
                "confidence": round(confidence, 4),
                "probability": round(probability, 4),
                "risk_score": round(risk_score, 2),
                "threat_level": threat_level,
                "inference_time": round(inference_time, 4),
                "model_used": model_name,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Log to database
            DatabaseService.log_prediction(
                model_name=model_name,
                prediction=prediction,
                confidence=confidence,
                probability=probability,
                risk_score=risk_score,
                threat_level=threat_level,
                latency=inference_time
            )
            
            logger.info(f"Prediction: {prediction}, Confidence: {confidence:.4f}, Model: {model_name}")
            
            return result
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise

class ThreatIntelligenceService:
    """Generate threat intelligence reports"""
    
    THREAT_CATEGORIES = {
        "DoS": "Denial of Service",
        "DDoS": "Distributed Denial of Service",
        "PortScan": "Port Scanning",
        "BruteForce": "Brute Force Attack",
        "Bot": "Botnet Activity",
        "WebAttack": "Web Application Attack",
        "Heartbleed": "Heartbleed Vulnerability",
        "Infiltration": "Network Infiltration"
    }
    
    MITIGATIONS = {
        "DoS": "Implement rate limiting and traffic filtering",
        "DDoS": "Deploy DDoS mitigation service and load balancing",
        "PortScan": "Enable IDS/IPS and restrict network access",
        "BruteForce": "Enforce strong password policies and MFA",
        "Bot": "Update antivirus and monitor for C2 communications",
        "WebAttack": "Apply WAF rules and patch web applications",
        "Heartbleed": "Update OpenSSL and patch vulnerable systems",
        "Infiltration": "Segment network and monitor lateral movement"
    }
    
    @staticmethod
    def generate_report(prediction_result: Dict[str, Any], attack_type: str = None) -> Dict[str, Any]:
        """
        Generate threat intelligence report
        
        Args:
            prediction_result: Result from PredictionService.predict()
            attack_type: Specific attack type if known
        
        Returns:
            Threat intelligence report
        """
        
        is_attack = prediction_result["prediction"] == 1
        probability = prediction_result["probability"]
        
        if is_attack:
            threat_level = prediction_result["threat_level"]
            risk_score = prediction_result["risk_score"]
            threat_category = attack_type or "Unknown Attack"
            mitigation = ThreatIntelligenceService.MITIGATIONS.get(
                threat_category.replace(" ", ""),
                "Investigate and isolate affected systems"
            )
            business_impact = "Active threat to network security"
        else:
            threat_level = "LOW"
            risk_score = prediction_result["risk_score"]
            threat_category = "Normal Traffic"
            mitigation = "No action required"
            business_impact = "No threat detected"
        
        report = {
            "threat_level": threat_level,
            "risk_score": round(risk_score, 2),
            "threat_category": threat_category,
            "confidence": prediction_result["confidence"],
            "business_impact": business_impact,
            "recommended_mitigation": mitigation,
            "timestamp": prediction_result["timestamp"],
            "model_used": prediction_result["model_used"]
        }
        
        return report
