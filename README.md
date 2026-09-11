# AdvSecure - AI-Powered Adversarial Defense Framework for Intelligent Intrusion Detection Systems

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-70%25%20complete-orange)

## Overview

AdvSecure is an enterprise-grade AI cybersecurity platform designed to detect malicious network traffic while evaluating the robustness of AI models against adversarial attacks. The system combines artificial intelligence, network security, and adversarial machine learning to create a comprehensive Security Operations Center (SOC) platform.

## Key Features

✅ **AI-Powered Intrusion Detection**
- Dual-model architecture (XGBoost + Deep Neural Network)
- 99.7% accuracy on CICIDS2017 dataset
- Real-time traffic classification

✅ **Threat Intelligence & Analytics**
- Automatic threat categorization
- Risk scoring and threat level assessment
- Business impact analysis
- Recommended mitigation strategies

✅ **Adversarial Robustness Testing**
- FGSM attack simulation using IBM ART
- Epsilon sensitivity analysis
- Model robustness evaluation
- Accuracy degradation metrics

✅ **Enterprise Dashboard**
- SOC-style real-time dashboard
- Threat timeline visualization
- Attack distribution charts
- Model performance radar

✅ **Comprehensive Audit Logging**
- Prediction history tracking
- Attack simulation logs
- Detailed audit trails
- Searchable and filterable logs

## Project Structure

```
AdvSecure/
├── backend/                 # FastAPI Python backend
│   ├── api/                # API routes
│   ├── services/           # Business logic services
│   ├── models/             # ML model loading
│   ├── database/           # SQLite database
│   ├── config/             # Configuration
│   ├── utils/              # Data processing & training
│   ├── main.py             # FastAPI entry point
│   └── requirements.txt     # Python dependencies
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Application pages
│   │   ├── layouts/        # Layout components
│   │   ├── charts/         # Chart components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   └── styles/         # Global styles
│   ├── package.json        # npm dependencies
│   └── vite.config.js      # Vite configuration
├── models/                 # Trained ML models
│   ├── base_xgboost.pkl
│   ├── base_dnn.keras
│   └── scaler.pkl
├── datasets/               # Dataset files
├── docs/                   # Documentation
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Backend Setup

```bash
# Navigate to project directory
cd AdvSecure

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Prepare dataset and train models
cd ..
python backend/utils/prepare_data.py
python backend/utils/train_models.py

# Start API server
cd backend
python main.py
```

The API will be available at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## API Endpoints

### Core Prediction APIs

**POST /api/predict**
- Predict traffic as Normal or Attack
- Request: `{ "data": [float...52], "model": "xgboost"|"dnn" }`
- Returns: Prediction, confidence, probability, risk score, threat level

**POST /api/predict/csv**
- Batch predict from CSV file
- Parameters: `file` (CSV), `model` (query param)
- Returns: Array of predictions

**POST /api/attack**
- Simulate FGSM adversarial attack
- Request: `{ "data": [[float...52]], "epsilon": 0.1, "attack_type": "xgboost"|"dnn" }`
- Returns: Original/adversarial accuracy, prediction changes, feature changes

### Dashboard & Analytics

**GET /api/dashboard**
- Returns dashboard metrics (total predictions, threats, accuracy, etc.)

**GET /api/analytics**
- Returns detailed analytics (precision, recall, F1, ROC AUC, confusion matrix)

**GET /api/logs**
- Returns prediction and audit logs
- Query: `limit` (default: 100)

**GET /api/models**
- Returns available models and their metadata

**GET /api/health**
- Health check endpoint

## Dashboard Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Executive summary with KPIs, threat timeline, distribution charts |
| **Dataset** | Dataset overview, class distribution, feature list, preprocessing info |
| **Traffic Monitor** | CSV upload, searchable traffic table, pagination, sorting |
| **Intrusion Detection** | Model selection, feature input, real-time predictions |
| **Threat Intelligence** | Threat categorization, risk scoring, business impact, mitigation |
| **Attack Simulation** | FGSM attacks, epsilon tuning, robustness metrics |
| **Analytics** | Model performance radar, epsilon sensitivity, ROC AUC, confusion matrix |
| **Audit Logs** | Prediction history, filtering, pagination, search |
| **Reports** | Placeholder for PDF incident reports (final phase) |
| **Settings** | Theme, default model, epsilon, API status |

## Models

### XGBoost Model
- **Purpose**: Fast, high-accuracy predictions
- **Architecture**: Gradient boosting (100 estimators)
- **Accuracy**: 99.70%
- **Use Case**: Real-time detection, batch processing

### Deep Neural Network
- **Purpose**: Gradient-based predictions for adversarial attacks
- **Architecture**: 
  - Input Layer (52 features)
  - Dense 128 + Dropout
  - Dense 64 + Dropout
  - Dense 32 + Dropout
  - Output Layer (Sigmoid)
- **Accuracy**: 99.70%
- **Use Case**: Adversarial robustness testing

## Database Schema

### predictions table
- id, timestamp, model_name, prediction, confidence, probability
- risk_score, threat_level, latency

### attack_logs table
- id, timestamp, epsilon, original_accuracy, adversarial_accuracy
- confidence_drop, prediction_changes, feature_changes_count

### audit_logs table
- id, action, status, timestamp, details

### model_information table
- id, model_name, version, training_date
- accuracy, precision, recall, f1_score, status

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **ML Libraries**: TensorFlow, Keras, XGBoost, Scikit-learn
- **Adversarial**: IBM Adversarial Robustness Toolbox (ART)
- **Database**: SQLite
- **Server**: Uvicorn

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Styling**: Tailwind CSS 3.4.0
- **Charts**: Recharts 2.10.0
- **Animations**: Framer Motion 10.16.0
- **HTTP Client**: Axios 1.6.0
- **Icons**: React Icons 4.11.0
- **Routing**: React Router 6.20.0

## Performance Metrics

### Model Performance
- **Accuracy**: 99.70%
- **Precision**: 99.50% (XGBoost), 99.50% (DNN)
- **Recall**: 98.50% (XGBoost), 99.00% (DNN)
- **F1-Score**: 0.9924 (XGBoost), 0.9925 (DNN)
- **ROC AUC**: 1.0000

### Dataset
- **Total Samples**: 10,000
- **Training Set**: 8,000 (80%)
- **Test Set**: 2,000 (20%)
- **Features**: 52 numeric features
- **Classes**: Binary (Normal: 80%, Attack: 20%)

## Current Status (70% Complete)

### ✅ Completed
- Complete project structure
- Backend initialization
- Database schema and services
- Data preprocessing pipeline
- Model training (XGBoost + DNN)
- All API endpoints (/predict, /attack, /dashboard, /analytics, /logs, /models)
- React frontend initialization
- All 10 dashboard pages
- API integration
- Threat intelligence module

## Deployment: Vercel + Render

This project works well with a split deployment:

- **Frontend** on **Vercel**
- **Backend** on **Render**

### Backend on Render

Use these settings:

- **Root directory**: `backend`
- **Build command**: `pip install -r requirements.txt`
- **Start command**: `gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT`

Environment variables:

```bash
DEBUG=False
DATABASE_URL=sqlite:///./backend/database/advsecure.db
XGBOOST_MODEL_PATH=./models/base_xgboost.pkl
DNN_MODEL_PATH=./models/base_dnn.keras
SCALER_PATH=./models/scaler.pkl
LOG_LEVEL=INFO
LOG_FILE=./backend/logs/advsecure.log
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

If you use more than one frontend domain, separate them with commas:

```bash
CORS_ORIGINS=https://your-vercel-app.vercel.app,https://www.yourdomain.com
```

### Frontend on Vercel

Use these settings:

- **Root directory**: `frontend`
- **Build command**: `npm run build`
- **Output directory**: `dist`

Environment variable:

```bash
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

### Why this setup is safe

- The frontend calls the backend via a full API URL instead of a local dev proxy.
- The backend only allows requests from the Vercel origin(s) you specify.
- The app still keeps `/api` as the local default for development.

### Deployment notes

- Keep model files in `backend/models/` so Render can load them.
- Use persistent storage or a managed database if you need durable SQLite data.
- Do not use `npm run dev` in production.
- Adversarial attack simulation
- Audit logging system
- Comprehensive UI with Tailwind CSS

### 🔄 Remaining (for Final Review)
- Adversarial Defense Engine (robust DNN training)
- Real-time packet capture
- User authentication & authorization
- Docker containerization
- MLflow experiment tracking
- Prometheus metrics
- Grafana dashboards
- PDF incident report generation
- Model deployment pipeline

## Usage Examples

### Making Predictions

```python
import requests

# Single prediction
response = requests.post(
    'http://localhost:8000/api/predict',
    json={
        'data': [1.5, 2.3, 0.1, ...52 features...],
        'model': 'xgboost'
    }
)
print(response.json())
```

### Running Attack Simulation

```python
# FGSM attack with epsilon=0.1
response = requests.post(
    'http://localhost:8000/api/attack',
    json={
        'data': [[1.5, 2.3, 0.1, ...52 features...]],
        'epsilon': 0.1,
        'attack_type': 'dnn'
    }
)
print(response.json())
```

## Configuration

### Environment Variables (.env)
```
DEBUG=True
DATABASE_URL=sqlite:///./backend/database/advsecure.db
XGBOOST_MODEL_PATH=./models/base_xgboost.pkl
DNN_MODEL_PATH=./models/base_dnn.keras
SCALER_PATH=./models/scaler.pkl
DEFAULT_EPSILON=0.1
LOG_LEVEL=INFO
```

## Development

### Starting Development Servers
```bash
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

### API Documentation
After starting the backend, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Security Considerations

- All predictions are logged for audit trails
- Models validated against adversarial attacks
- CORS configured for frontend communication
- Database transactions for data integrity
- Input validation on all API endpoints

## Future Roadmap

1. **Phase 2 (Final)**
   - Real-time packet capture and analysis
   - WebSocket for live dashboard updates
   - User authentication with JWT
   - Advanced threat hunting tools
   - Model retraining pipeline
   - Docker deployment

2. **Phase 3 (Post-Review)**
   - Kubernetes orchestration
   - Multi-model ensemble
   - Custom rule engine
   - SIEM integration
   - Mobile app

## Contributing

This is an academic project. For modifications:

1. Follow clean architecture principles
2. Add tests for new features
3. Document API changes
4. Update this README

## License

MIT License - See LICENSE file

## Author

AdvSecure Development Team
Version 1.0.0 | 2026

---

**Status**: Second Review - 70% Complete ✓
