#!/usr/bin/env python3
"""
Download and preprocess CICIDS2017 dataset
"""

import os
import pandas as pd
import numpy as np
import logging
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.data_processor import DataProcessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_cicids2017():
    """
    Download CICIDS2017 dataset
    Note: This requires manual download from Kaggle or use of sample data
    """
    dataset_path = "./datasets/CICIDS2017.csv"
    
    if os.path.exists(dataset_path):
        logger.info(f"Dataset already exists at {dataset_path}")
        return dataset_path
    
    logger.info("CICIDS2017 dataset not found.")
    logger.info("Please download from: https://www.kaggle.com/datasets/cicdataset/cicids2017")
    logger.info(f"And place it at: {dataset_path}")
    
    return None

def create_sample_dataset():
    """
    Create a sample dataset for testing if CICIDS2017 is not available
    This is for development purposes only
    """
    dataset_path = "./datasets/sample_traffic.csv"
    
    if os.path.exists(dataset_path):
        logger.info(f"Sample dataset already exists at {dataset_path}")
        return dataset_path
    
    logger.info("Creating sample dataset for testing...")
    
    os.makedirs("./datasets", exist_ok=True)
    
    # Create sample data with 52 numeric features (matching CICIDS2017 structure)
    n_samples = 10000
    
    # Generate synthetic data
    np.random.seed(42)
    data = np.random.randn(n_samples, 52)
    
    # Add some pattern to distinguish normal from attack
    for i in range(n_samples):
        if i % 5 == 0:  # 20% attacks
            data[i] = data[i] * 2 + np.random.randn(52)
    
    feature_names = [f"Feature_{i}" for i in range(52)]
    df = pd.DataFrame(data, columns=feature_names)
    
    # Add label column
    labels = ["BENIGN" if i % 5 != 0 else "Attack" for i in range(n_samples)]
    df["Label"] = labels
    
    df.to_csv(dataset_path, index=False)
    logger.info(f"Sample dataset created at {dataset_path}")
    
    return dataset_path

def preprocess_dataset(dataset_path: str):
    """Preprocess the dataset and save train/test splits"""
    
    processor = DataProcessor()
    
    try:
        X_train, X_test, y_train, y_test, features = processor.preprocess(dataset_path)
        
        # Save preprocessing data
        os.makedirs("./models", exist_ok=True)
        
        # Save feature list
        with open("./models/features.txt", "w") as f:
            f.write("\n".join(features))
        
        logger.info(f"Feature list saved with {len(features)} features")
        logger.info("Dataset preprocessing complete!")
        logger.info(f"Train set: {X_train.shape}")
        logger.info(f"Test set: {X_test.shape}")
        
        return X_train, X_test, y_train, y_test
        
    except Exception as e:
        logger.error(f"Error preprocessing dataset: {e}")
        raise

if __name__ == "__main__":
    # Try to use CICIDS2017
    dataset_path = download_cicids2017()
    
    # If not available, create sample dataset
    if dataset_path is None or not os.path.exists(dataset_path):
        dataset_path = create_sample_dataset()
    
    # Preprocess
    if dataset_path:
        preprocess_dataset(dataset_path)
