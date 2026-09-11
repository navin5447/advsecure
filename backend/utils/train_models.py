#!/usr/bin/env python3
"""
Train AI models for intrusion detection
"""

import os
import numpy as np
import pandas as pd
import logging
from datetime import datetime
import joblib
import warnings
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

warnings.filterwarnings('ignore')

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from xgboost import XGBClassifier
from tensorflow import keras
from tensorflow.keras import layers, regularizers
from utils.data_processor import DataProcessor
from database.db_service import DatabaseService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelTrainer:
    """Train XGBoost and DNN models"""
    
    def __init__(self):
        self.processor = DataProcessor()
        self.xgb_model = None
        self.dnn_model = None
    
    def train_xgboost(self, X_train, X_test, y_train, y_test):
        """Train XGBoost model"""
        logger.info("Training XGBoost model...")
        
        self.xgb_model = XGBClassifier(
            n_estimators=100,
            max_depth=7,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbosity=0,
            n_jobs=-1
        )
        
        self.xgb_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.xgb_model.predict(X_test)
        y_pred_proba = self.xgb_model.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        logger.info(f"XGBoost Metrics:")
        logger.info(f"  Accuracy: {accuracy:.4f}")
        logger.info(f"  Precision: {precision:.4f}")
        logger.info(f"  Recall: {recall:.4f}")
        logger.info(f"  F1 Score: {f1:.4f}")
        logger.info(f"  ROC AUC: {roc_auc:.4f}")
        
        # Save model
        os.makedirs("./models", exist_ok=True)
        joblib.dump(self.xgb_model, "./models/base_xgboost.pkl")
        logger.info("XGBoost model saved to ./models/base_xgboost.pkl")
        
        # Save to database
        DatabaseService.save_model_info(
            model_name="XGBoost",
            version="1.0",
            training_date=datetime.utcnow().isoformat(),
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            f1_score=f1,
            status="active"
        )
        
        return {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "roc_auc": roc_auc
        }
    
    def train_dnn(self, X_train, X_test, y_train, y_test):
        """Train Deep Neural Network model"""
        logger.info("Training Deep Neural Network model...")
        
        input_dim = X_train.shape[1]
        
        model = keras.Sequential([
            layers.Dense(128, activation='relu', input_dim=input_dim),
            layers.Dropout(0.3),
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        # Train
        history = model.fit(
            X_train, y_train,
            validation_split=0.2,
            epochs=20,
            batch_size=32,
            verbose=0
        )
        
        # Evaluate
        y_pred_proba = model.predict(X_test, verbose=0)
        y_pred = (y_pred_proba > 0.5).astype(int).flatten()
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        logger.info(f"DNN Metrics:")
        logger.info(f"  Accuracy: {accuracy:.4f}")
        logger.info(f"  Precision: {precision:.4f}")
        logger.info(f"  Recall: {recall:.4f}")
        logger.info(f"  F1 Score: {f1:.4f}")
        logger.info(f"  ROC AUC: {roc_auc:.4f}")
        
        # Save model
        os.makedirs("./models", exist_ok=True)
        model.save("./models/base_dnn.keras")
        logger.info("DNN model saved to ./models/base_dnn.keras")
        
        # Save to database
        DatabaseService.save_model_info(
            model_name="DNN",
            version="1.0",
            training_date=datetime.utcnow().isoformat(),
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            f1_score=f1,
            status="active"
        )
        
        self.dnn_model = model
        
        return {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "roc_auc": roc_auc
        }

def train_models(dataset_path: str):
    """Complete training pipeline"""
    
    trainer = ModelTrainer()
    
    # Preprocess data
    logger.info("Preprocessing dataset...")
    X_train, X_test, y_train, y_test, features = trainer.processor.preprocess(dataset_path)
    
    # Train XGBoost
    xgb_metrics = trainer.train_xgboost(X_train, X_test, y_train, y_test)
    
    # Train DNN
    dnn_metrics = trainer.train_dnn(X_train, X_test, y_train, y_test)
    
    logger.info("\n" + "="*50)
    logger.info("MODEL TRAINING COMPLETE")
    logger.info("="*50)
    logger.info(f"XGBoost Accuracy: {xgb_metrics['accuracy']:.4f}")
    logger.info(f"DNN Accuracy: {dnn_metrics['accuracy']:.4f}")
    logger.info("="*50)

if __name__ == "__main__":
    # First prepare data
    from utils.prepare_data import download_cicids2017, create_sample_dataset
    
    dataset_path = download_cicids2017()
    if dataset_path is None or not os.path.exists(dataset_path):
        dataset_path = create_sample_dataset()
    
    # Initialize database
    from database.db_init import create_database
    create_database()
    
    # Train models
    if dataset_path:
        train_models(dataset_path)
