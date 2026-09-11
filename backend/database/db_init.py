import os
import sqlite3
from datetime import datetime
from config.settings import settings

def create_database():
    """Initialize SQLite database with all required tables"""
    
    # Create database directory if it doesn't exist
    db_dir = os.path.dirname(settings.DATABASE_URL.replace("sqlite:///", ""))
    os.makedirs(db_dir, exist_ok=True)
    
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Predictions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        model_name TEXT NOT NULL,
        prediction INTEGER NOT NULL,
        confidence REAL NOT NULL,
        probability REAL NOT NULL,
        risk_score REAL NOT NULL,
        threat_level TEXT NOT NULL,
        latency REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Attack logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attack_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        epsilon REAL NOT NULL,
        original_accuracy REAL NOT NULL,
        adversarial_accuracy REAL NOT NULL,
        confidence_drop REAL NOT NULL,
        prediction_changes INTEGER NOT NULL,
        feature_changes_count INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Audit logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Model information table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS model_information (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT UNIQUE NOT NULL,
        version TEXT NOT NULL,
        training_date TEXT NOT NULL,
        accuracy REAL NOT NULL,
        precision REAL NOT NULL,
        recall REAL NOT NULL,
        f1_score REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()
    
    print(f"Database initialized at {db_path}")

if __name__ == "__main__":
    create_database()
