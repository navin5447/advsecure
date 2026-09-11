import os
import joblib
import logging
import numpy as np
from typing import Tuple
from tensorflow import keras
from config.settings import settings

logger = logging.getLogger(__name__)

class ModelManager:
    """Manage loading and using AI models"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.xgb_model = None
        self.dnn_model = None
        self.scaler = None
        self.feature_columns = None
        self._load_models()
        self._initialized = True
    
    def _load_models(self):
        """Load models from disk"""
        try:
            # Load XGBoost
            if os.path.exists(settings.XGBOOST_MODEL_PATH):
                self.xgb_model = joblib.load(settings.XGBOOST_MODEL_PATH)
                logger.info(f"Loaded XGBoost model from {settings.XGBOOST_MODEL_PATH}")
            else:
                logger.warning(f"XGBoost model not found at {settings.XGBOOST_MODEL_PATH}")
            
            # Load DNN
            if os.path.exists(settings.DNN_MODEL_PATH):
                self.dnn_model = keras.models.load_model(settings.DNN_MODEL_PATH)
                logger.info(f"Loaded DNN model from {settings.DNN_MODEL_PATH}")
            else:
                logger.warning(f"DNN model not found at {settings.DNN_MODEL_PATH}")
            
            # Load Scaler
            if os.path.exists(settings.SCALER_PATH):
                self.scaler = joblib.load(settings.SCALER_PATH)
                logger.info(f"Loaded scaler from {settings.SCALER_PATH}")
            else:
                logger.warning(f"Scaler not found at {settings.SCALER_PATH}")
            
            # Load feature columns
            features_path = "./models/features.txt"
            if os.path.exists(features_path):
                with open(features_path, "r") as f:
                    self.feature_columns = [line.strip() for line in f.readlines()]
                logger.info(f"Loaded {len(self.feature_columns)} features")
        
        except Exception as e:
            logger.error(f"Error loading models: {e}")
    
    def is_ready(self) -> bool:
        """Check if models are loaded"""
        return self.xgb_model is not None and self.dnn_model is not None and self.scaler is not None
    
    def predict_xgboost(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Predict with XGBoost"""
        if self.xgb_model is None:
            raise RuntimeError("XGBoost model not loaded")
        
        predictions = self.xgb_model.predict(X)
        probabilities = self.xgb_model.predict_proba(X)[:, 1]
        
        return predictions, probabilities
    
    def predict_dnn(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Predict with DNN"""
        if self.dnn_model is None:
            raise RuntimeError("DNN model not loaded")
        
        probabilities = self.dnn_model.predict(X, verbose=0).flatten()
        predictions = (probabilities > 0.5).astype(int)
        
        return predictions, probabilities
    
    def scale_input(self, X: np.ndarray) -> np.ndarray:
        """Scale input features"""
        if self.scaler is None:
            raise RuntimeError("Scaler not loaded")
        
        return self.scaler.transform(X)

def get_model_manager() -> ModelManager:
    """Get singleton model manager instance"""
    return ModelManager()
