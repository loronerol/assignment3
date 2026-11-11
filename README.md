# AI Model Web App (React + FastAPI)

## 1. Add your model
Copy your trained model to `backend/model/model.joblib` (or `model.pkl`).
Works with any scikit-learn estimator or Pipeline. The input form, class names and charts
are inferred from the model. To set slider ranges, defaults, units or metrics, add an optional
`backend/model/meta.json`:
```json
{"name": "My model",
 "features": [{"name": "age", "min": 18, "max": 90, "default": 40, "unit": "years"}],
 "metrics": {"accuracy": 0.93}}
```
Not scikit-learn? Edit `ModelService.predict()` in `backend/model_service.py` only.

## 2. Run
```bash
# terminal 1
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && uvicorn main:app --reload --port 8000
# terminal 2
cd frontend && npm install && npm run dev      # http://localhost:5173
```
API docs: http://localhost:8000/docs
