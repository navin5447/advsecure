import sqlite3
from datetime import datetime
from config.settings import settings
from typing import List, Dict, Any

class DatabaseService:
    """Service for database operations"""
    
    @staticmethod
    def get_connection():
        """Get database connection"""
        db_path = settings.DATABASE_URL.replace("sqlite:///", "")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    @staticmethod
    def log_prediction(
        model_name: str,
        prediction: int,
        confidence: float,
        probability: float,
        risk_score: float,
        threat_level: str,
        latency: float
    ) -> int:
        """Log prediction to database"""
        conn = DatabaseService.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
        INSERT INTO predictions 
        (timestamp, model_name, prediction, confidence, probability, risk_score, threat_level, latency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.utcnow().isoformat(),
            model_name,
            prediction,
            confidence,
            probability,
            risk_score,
            threat_level,
            latency
        ))
        
        conn.commit()
        prediction_id = cursor.lastrowid
        conn.close()
        
        return prediction_id
    
    @staticmethod
    def log_attack(
        epsilon: float,
        original_accuracy: float,
        adversarial_accuracy: float,
        confidence_drop: float,
        prediction_changes: int,
        feature_changes_count: int
    ) -> int:
        """Log adversarial attack to database"""
        conn = DatabaseService.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
        INSERT INTO attack_logs
        (timestamp, epsilon, original_accuracy, adversarial_accuracy, confidence_drop, prediction_changes, feature_changes_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.utcnow().isoformat(),
            epsilon,
            original_accuracy,
            adversarial_accuracy,
            confidence_drop,
            prediction_changes,
            feature_changes_count
        ))
        
        conn.commit()
        attack_id = cursor.lastrowid
        conn.close()
        
        return attack_id
    
    @staticmethod
    def log_audit(action: str, status: str, details: str = None):
        """Log audit action"""
        conn = DatabaseService.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
        INSERT INTO audit_logs (action, status, timestamp, details)
        VALUES (?, ?, ?, ?)
        """, (
            action,
            status,
            datetime.utcnow().isoformat(),
            details
        ))
        
        conn.commit()
        conn.close()
    
    @staticmethod
    def get_predictions(limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent predictions"""
        conn = DatabaseService.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT * FROM predictions ORDER BY timestamp DESC LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    @staticmethod
    def get_attack_logs(limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent attack logs"""
        conn = DatabaseService.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT * FROM attack_logs ORDER BY timestamp DESC LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    @staticmethod
    def get_audit_logs(limit: int = 100) -> List[Dict[str, Any]]:
        """Get audit logs"""
        conn = DatabaseService.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    @staticmethod
    def save_model_info(
        model_name: str,
        version: str,
        training_date: str,
        accuracy: float,
        precision: float,
        recall: float,
        f1_score: float,
        status: str = "active"
    ):
        """Save model information"""
        conn = DatabaseService.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
        INSERT OR REPLACE INTO model_information
        (model_name, version, training_date, accuracy, precision, recall, f1_score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            model_name,
            version,
            training_date,
            accuracy,
            precision,
            recall,
            f1_score,
            status
        ))
        
        conn.commit()
        conn.close()
    
    @staticmethod
    def get_model_info(model_name: str = None) -> List[Dict[str, Any]]:
        """Get model information"""
        conn = DatabaseService.get_connection()
        cursor = conn.cursor()
        
        if model_name:
            cursor.execute("SELECT * FROM model_information WHERE model_name = ?", (model_name,))
        else:
            cursor.execute("SELECT * FROM model_information")
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    @staticmethod
    def get_stats() -> Dict[str, Any]:
        """Get dashboard statistics"""
        conn = DatabaseService.get_connection()
        cursor = conn.cursor()
        
        # Total predictions
        cursor.execute("SELECT COUNT(*) as count FROM predictions")
        total_predictions = cursor.fetchone()['count']
        
        # Normal vs Attack
        cursor.execute("SELECT SUM(CASE WHEN prediction = 0 THEN 1 ELSE 0 END) as normal, SUM(CASE WHEN prediction = 1 THEN 1 ELSE 0 END) as attack FROM predictions")
        result = cursor.fetchone()
        normal = result['normal'] or 0
        attack = result['attack'] or 0
        
        # Average confidence
        cursor.execute("SELECT AVG(confidence) as avg_confidence FROM predictions")
        avg_confidence = cursor.fetchone()['avg_confidence'] or 0
        
        # Threat levels
        cursor.execute("SELECT threat_level, COUNT(*) as count FROM predictions GROUP BY threat_level")
        threat_distribution = {row['threat_level']: row['count'] for row in cursor.fetchall()}
        
        conn.close()
        
        return {
            "total_predictions": total_predictions,
            "normal": normal,
            "attack": attack,
            "avg_confidence": round(avg_confidence, 4),
            "threat_distribution": threat_distribution
        }
