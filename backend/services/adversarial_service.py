import numpy as np
import logging
from typing import Dict, Tuple, Any
import tensorflow as tf
from art.attacks.evasion import FastGradientMethod
from art.estimators.classification import XGBoostClassifier as ARTXGBoostClassifier
from art.estimators.classification import TensorFlowV2Classifier
from models.model_manager import get_model_manager
from database.db_service import DatabaseService
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class AdversarialAttackService:
    """Service for adversarial attack simulation"""
    
    @staticmethod
    def attack_xgboost(
        X: np.ndarray,
        y: np.ndarray,
        epsilon: float = 0.1
    ) -> Dict[str, Any]:
        """
        Perform FGSM attack on XGBoost model
        
        Args:
            X: Input features
            y: True labels
            epsilon: Attack perturbation strength
        
        Returns:
            Attack results
        """
        try:
            manager = get_model_manager()
            
            if manager.xgb_model is None:
                raise RuntimeError("XGBoost model not loaded")
            
            # Original predictions
            original_pred = manager.xgb_model.predict(X)
            original_prob = manager.xgb_model.predict_proba(X)[:, 1]
            original_accuracy = np.mean(original_pred == y)
            
            # Create ART classifier and attack
            try:
                classifier = ARTXGBoostClassifier(model=manager.xgb_model)
                attack = FastGradientMethod(
                    estimator=classifier,
                    eps=epsilon,
                    norm=np.inf
                )

                # Generate adversarial examples
                X_adv = attack.generate(x=X)
            except Exception as e:
                # ART's FGSM requires gradient-capable estimators; XGBoost may not support this.
                logger.warning(f"FGSM not supported for XGBoost model: {e}")
                return {
                    "original_accuracy": float(0.0),
                    "adversarial_accuracy": float(0.0),
                    "accuracy_loss": float(0.0),
                    "prediction_changes": 0,
                    "feature_changes_count": 0,
                    "avg_confidence_drop": 0.0,
                    "epsilon": epsilon,
                    "error": f"FGSM attack not supported for XGBoost models: {e}",
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            # Predictions on adversarial examples
            adv_pred = manager.xgb_model.predict(X_adv)
            adv_prob = manager.xgb_model.predict_proba(X_adv)[:, 1]
            adversarial_accuracy = np.mean(adv_pred == y)
            
            # Calculate metrics
            prediction_changes = np.sum(original_pred != adv_pred)
            feature_changes = np.sum(np.abs(X - X_adv) > 1e-6)
            avg_confidence_drop = np.mean(np.abs(original_prob - adv_prob))
            
            result = {
                "original_accuracy": float(original_accuracy),
                "adversarial_accuracy": float(adversarial_accuracy),
                "accuracy_loss": float(original_accuracy - adversarial_accuracy),
                "prediction_changes": int(prediction_changes),
                "feature_changes_count": int(feature_changes),
                "avg_confidence_drop": float(avg_confidence_drop),
                "epsilon": epsilon,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Log to database
            DatabaseService.log_attack(
                epsilon=epsilon,
                original_accuracy=original_accuracy,
                adversarial_accuracy=adversarial_accuracy,
                confidence_drop=avg_confidence_drop,
                prediction_changes=prediction_changes,
                feature_changes_count=feature_changes
            )
            
            logger.info(f"FGSM Attack Results (XGBoost, eps={epsilon}):")
            logger.info(f"  Original Accuracy: {original_accuracy:.4f}")
            logger.info(f"  Adversarial Accuracy: {adversarial_accuracy:.4f}")
            logger.info(f"  Accuracy Loss: {original_accuracy - adversarial_accuracy:.4f}")
            
            return result
            
        except Exception as e:
            logger.error(f"XGBoost attack error: {e}")
            raise
    
    @staticmethod
    def attack_dnn(
        X: np.ndarray,
        y: np.ndarray,
        epsilon: float = 0.1
    ) -> Dict[str, Any]:
        """
        Perform FGSM attack on DNN model
        
        Args:
            X: Input features
            y: True labels
            epsilon: Attack perturbation strength
        
        Returns:
            Attack results
        """
        try:
            manager = get_model_manager()
            
            if manager.dnn_model is None:
                raise RuntimeError("DNN model not loaded")

            X = np.asarray(X, dtype=float)
            y = np.asarray(y, dtype=float).reshape(-1, 1)

            # The DNN was trained on scaled features, so evaluate the attack in the same space.
            X_scaled = manager.scale_input(X)
            
            # Original predictions
            original_prob = manager.dnn_model.predict(X_scaled, verbose=0).flatten()
            original_pred = (original_prob > 0.5).astype(int)
            original_accuracy = np.mean(original_pred == y)

            # Generate adversarial examples with a direct FGSM step.
            x_tensor = tf.convert_to_tensor(X_scaled, dtype=tf.float32)
            y_tensor = tf.convert_to_tensor(y, dtype=tf.float32)
            
            with tf.GradientTape() as tape:
                tape.watch(x_tensor)
                predictions = manager.dnn_model(x_tensor, training=False)
                loss = tf.keras.losses.binary_crossentropy(y_tensor, predictions)
                loss = tf.reduce_mean(loss)

            gradients = tape.gradient(loss, x_tensor)
            if gradients is None:
                raise RuntimeError("Unable to compute gradients for FGSM attack")

            X_adv = x_tensor + epsilon * tf.sign(gradients)

            # Predictions on adversarial examples
            adv_prob = manager.dnn_model.predict(X_adv.numpy(), verbose=0).flatten()
            adv_pred = (adv_prob > 0.5).astype(int)
            adversarial_accuracy = np.mean(adv_pred == y)
            
            # Calculate metrics
            prediction_changes = np.sum(original_pred != adv_pred)
            feature_changes = np.sum(np.abs(X - X_adv) > 1e-6)
            avg_confidence_drop = np.mean(np.abs(original_prob - adv_prob))
            
            result = {
                "original_accuracy": float(original_accuracy),
                "adversarial_accuracy": float(adversarial_accuracy),
                "accuracy_loss": float(original_accuracy - adversarial_accuracy),
                "prediction_changes": int(prediction_changes),
                "feature_changes_count": int(feature_changes),
                "avg_confidence_drop": float(avg_confidence_drop),
                "epsilon": epsilon,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            logger.info(f"FGSM Attack Results (DNN, eps={epsilon}):")
            logger.info(f"  Original Accuracy: {original_accuracy:.4f}")
            logger.info(f"  Adversarial Accuracy: {adversarial_accuracy:.4f}")
            logger.info(f"  Accuracy Loss: {original_accuracy - adversarial_accuracy:.4f}")
            
            return result
            
        except Exception as e:
            logger.error(f"DNN attack error: {e}")
            # Return graceful error response
            return {
                "original_accuracy": 0.0,
                "adversarial_accuracy": 0.0,
                "accuracy_loss": 0.0,
                "prediction_changes": 0,
                "feature_changes_count": 0,
                "avg_confidence_drop": 0.0,
                "epsilon": epsilon,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
