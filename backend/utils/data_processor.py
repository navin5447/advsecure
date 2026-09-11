import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import logging

logger = logging.getLogger(__name__)

class DataProcessor:
    """Process CICIDS2017 dataset"""
    
    def __init__(self, scaler_path: str = "./models/scaler.pkl"):
        self.scaler_path = scaler_path
        self.scaler = None
        self.feature_columns = None
        self.load_or_create_scaler()
    
    def load_or_create_scaler(self):
        """Load scaler if exists, otherwise create new one"""
        if os.path.exists(self.scaler_path):
            self.scaler = joblib.load(self.scaler_path)
            logger.info(f"Loaded scaler from {self.scaler_path}")
        else:
            self.scaler = StandardScaler()
            logger.info("Created new StandardScaler")
    
    def load_dataset(self, csv_path: str) -> pd.DataFrame:
        """Load dataset from CSV"""
        logger.info(f"Loading dataset from {csv_path}")
        df = pd.read_csv(csv_path)
        logger.info(f"Dataset shape: {df.shape}")
        return df
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove missing values and duplicates"""
        initial_shape = df.shape
        
        # Remove duplicates
        df = df.drop_duplicates()
        
        # Remove rows with missing values
        df = df.dropna()
        
        logger.info(f"Cleaned data: {initial_shape} -> {df.shape}")
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> tuple:
        """Prepare features and target label"""
        
        # Handle label column (case insensitive)
        label_col = None
        for col in df.columns:
            if col.lower() in ['label', 'class', 'target']:
                label_col = col
                break
        
        if label_col is None:
            raise ValueError("Cannot find label column in dataset")
        
        # Binary classification: 0 = normal, 1 = attack
        y = df[label_col].apply(lambda x: 0 if x == 'BENIGN' else 1)
        
        # Drop label and non-numeric columns
        X = df.drop(columns=[label_col])
        
        # Keep only numeric columns
        X = X.select_dtypes(include=[np.number])
        
        self.feature_columns = X.columns.tolist()
        
        logger.info(f"Features shape: {X.shape}")
        logger.info(f"Target distribution: {y.value_counts().to_dict()}")
        
        return X, y
    
    def scale_features(self, X: pd.DataFrame, fit: bool = True) -> np.ndarray:
        """Scale features using StandardScaler"""
        if fit:
            X_scaled = self.scaler.fit_transform(X)
            joblib.dump(self.scaler, self.scaler_path)
            logger.info(f"Scaler fitted and saved to {self.scaler_path}")
        else:
            X_scaled = self.scaler.transform(X)
            logger.info("Features scaled using existing scaler")
        
        return X_scaled
    
    def split_data(self, X: np.ndarray, y: np.ndarray, test_size: float = 0.2, random_state: int = 42):
        """Split data into train and test sets"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        logger.info(f"Train set: {X_train.shape}, Test set: {X_test.shape}")
        logger.info(f"Train - Normal: {(y_train==0).sum()}, Attack: {(y_train==1).sum()}")
        logger.info(f"Test - Normal: {(y_test==0).sum()}, Attack: {(y_test==1).sum()}")
        
        return X_train, X_test, y_train, y_test
    
    def preprocess(self, csv_path: str, test_size: float = 0.2):
        """Complete preprocessing pipeline"""
        df = self.load_dataset(csv_path)
        df = self.clean_data(df)
        X, y = self.prepare_features(df)
        X_scaled = self.scale_features(X, fit=True)
        X_train, X_test, y_train, y_test = self.split_data(X_scaled, y, test_size=test_size)
        
        return X_train, X_test, y_train, y_test, self.feature_columns
