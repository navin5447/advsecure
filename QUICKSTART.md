# AdvSecure - Quick Start Guide

## Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher  
- curl or Postman (for API testing)

## 30-Second Setup

### 1. Backend Setup
```bash
cd AdvSecure

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Start API server
cd backend
python main.py
```

Backend runs on `http://localhost:8000`

### 2. Frontend Setup (New Terminal)
```bash
cd AdvSecure/frontend

# Install dependencies  
npm install

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

## Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| Dashboard | http://localhost:5173 | Main UI |
| API Root | http://localhost:8000 | API base |
| Swagger Docs | http://localhost:8000/docs | API documentation |
| ReDoc Docs | http://localhost:8000/redoc | Alternative API docs |

## Quick API Tests

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Get Dashboard Metrics
```bash
curl http://localhost:8000/api/dashboard
```

### List Available Models
```bash
curl http://localhost:8000/api/models
```

### Make Prediction (Python)
```python
import requests

data = {
    "data": [1.0] * 52,  # 52 features
    "model": "xgboost"
}

response = requests.post('http://localhost:8000/api/predict', json=data)
print(response.json())
```

## Key Features to Explore

### Dashboard
Visit http://localhost:5173 and explore:
- Real-time traffic statistics
- Threat timeline visualization
- Attack distribution charts
- System health status

### Make a Prediction
1. Go to "Intrusion Detection" page
2. Choose XGBoost or DNN model
3. Enter 52 comma-separated feature values
4. Click "Make Prediction"
5. View results with confidence, risk score, threat level

### Simulate Attack
1. Go to "Attack Simulation" page
2. Adjust epsilon value (0.01-0.5)
3. Click "Generate FGSM Attack"
4. View accuracy drop and feature changes

### View Analytics
1. Go to "Analytics" page
2. See model performance metrics
3. Explore epsilon sensitivity analysis
4. Check ROC AUC and confusion matrix

### Upload Traffic
1. Go to "Traffic Monitor" page
2. Upload CSV file (format: 52 numeric columns)
3. View predictions in table
4. Search and filter results

## Project Structure

```
AdvSecure/
├── backend/                 # FastAPI backend
│   ├── main.py             # Entry point
│   ├── api/routes.py       # API endpoints
│   ├── services/           # Business logic
│   ├── models/             # ML models
│   ├── database/           # SQLite
│   └── utils/              # Helpers
├── frontend/               # React frontend
│   ├── src/pages/          # 10 pages
│   ├── src/components/     # Components
│   ├── src/charts/         # Chart components
│   └── package.json        # Dependencies
├── models/                 # Trained models
│   ├── base_xgboost.pkl
│   ├── base_dnn.keras
│   └── scaler.pkl
└── README.md              # Full documentation
```

## Troubleshooting

### Backend won't start
1. Check Python version: `python --version` (need 3.9+)
2. Verify virtual environment: `source venv/bin/activate`
3. Reinstall dependencies: `pip install -r backend/requirements.txt`
4. Check port 8000 isn't in use: `lsof -i :8000`

### Frontend won't load
1. Check Node version: `node -v` (need 18+)
2. Clear npm cache: `npm cache clean --force`
3. Reinstall: `rm -rf node_modules && npm install`
4. Check port 5173 isn't in use: `lsof -i :5173`

### API not responding
1. Confirm backend running: `curl http://localhost:8000/`
2. Check backend logs: `tail -f backend/logs/advsecure.log`
3. Verify CORS enabled in frontend `.env`

### Models not loading
1. Check files exist:
   - `models/base_xgboost.pkl` ✓
   - `models/base_dnn.keras` ✓
   - `models/scaler.pkl` ✓
2. Verify paths in `.env`
3. Check permissions on model files

## Common Tasks

### Make a CSV Prediction
```bash
# Create sample CSV (52 columns, no header)
python -c "import numpy as np, pandas as pd; df = pd.DataFrame(np.random.randn(10, 52)); df.to_csv('traffic.csv', index=False, header=False)"

# Upload via UI or API
curl -F "file=@traffic.csv" http://localhost:8000/api/predict/csv
```

### Simulate Adversarial Attack
```bash
python -c "
import requests
import json

data = [[1.0] * 52]
payload = {
    'data': data,
    'epsilon': 0.1,
    'attack_type': 'xgboost'
}

r = requests.post('http://localhost:8000/api/attack', json=payload)
print(json.dumps(r.json(), indent=2))
"
```

### View Prediction Logs
```bash
curl http://localhost:8000/api/logs?limit=10 | python -m json.tool
```

## Performance Tips

1. **Use XGBoost for speed** - ~0.5ms per prediction
2. **Use DNN for adversarial testing** - gradient-based attacks
3. **Batch predictions for large datasets** - CSV upload
4. **Monitor model health** - Check analytics page
5. **Review audit logs regularly** - Compliance tracking

## Next Steps

1. ✓ Run both servers
2. ✓ Explore dashboard
3. ✓ Make predictions
4. ✓ Simulate attacks
5. ✓ View analytics
6. ✓ Upload CSV data
7. ✓ Check API docs

## Documentation

- Full README: See `README.md`
- API Reference: Visit `http://localhost:8000/docs`
- Submission Report: See `SUBMISSION_REPORT.md`
- Backend Code: `backend/` directory
- Frontend Code: `frontend/src/` directory

## Support

For issues or questions:
1. Check server logs: `backend/logs/advsecure.log`
2. Review API docs: `http://localhost:8000/docs`
3. Inspect browser console: Press F12 in frontend
4. Check `.env` configuration

---

**Happy exploring! 🚀**

AdvSecure v1.0.0 | 70% Complete for Second Review
