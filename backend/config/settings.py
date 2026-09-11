import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings from environment variables"""
    
    # API
    API_TITLE = "AdvSecure"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = "AI-Powered Adversarial Defense Framework for Intelligent Intrusion Detection Systems"
    DEBUG = os.getenv("DEBUG", "False") == "True"
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/database/advsecure.db")
    
    # Models
    XGBOOST_MODEL_PATH = os.getenv("XGBOOST_MODEL_PATH", "./models/base_xgboost.pkl")
    DNN_MODEL_PATH = os.getenv("DNN_MODEL_PATH", "./models/base_dnn.keras")
    SCALER_PATH = os.getenv("SCALER_PATH", "./models/scaler.pkl")
    
    # Adversarial
    DEFAULT_EPSILON = float(os.getenv("DEFAULT_EPSILON", "0.1"))
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "./backend/logs/advsecure.log")
    
    # Feature size for models
    FEATURE_SIZE = 52
    
    # CORS
    _cors_env = os.getenv("CORS_ORIGINS", "")
    CORS_ORIGINS = [
        origin.strip()
        for origin in _cors_env.split(",")
        if origin.strip()
    ] or [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

settings = Settings()
