import csv, io, math
from collections import deque
from datetime import datetime, timezone

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model_service import ModelService

app = FastAPI(title="AI Model API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"],
                   allow_methods=["*"], allow_headers=["*"])

svc = ModelService()
history: deque = deque(maxlen=100)   # in-memory; swap for a DB if required


class PredictRequest(BaseModel):
    features: dict[str, float]


def validate(values: dict[str, float]) -> list[float]:
    missing = [n for n in svc.names if n not in values]
    if missing:
        raise HTTPException(422, f"Missing features: {', '.join(missing)}")
    row = []
    for f in svc.meta["features"]:
        v = values[f["name"]]
        if not math.isfinite(v):
            raise HTTPException(422, f"{f['name']} must be a finite number")
        row.append(v)
    return row


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/model-info")
def model_info():
    return svc.meta


@app.post("/api/predict")
def predict(req: PredictRequest):
    result = svc.predict([validate(req.features)])[0]
    entry = {"id": len(history) + 1, "time": datetime.now(timezone.utc).isoformat(),
             "input": req.features, **result}
    history.append(entry)
    return entry


@app.post("/api/predict/batch")
async def predict_batch(file: UploadFile = File(...)):
    """CSV with a header row containing every feature name."""
    text = (await file.read()).decode("utf-8-sig")
    rows, parsed = list(csv.DictReader(io.StringIO(text))), []
    if not rows:
        raise HTTPException(422, "CSV has no rows")
    try:
        for r in rows:
            parsed.append(validate({k.strip(): float(v) for k, v in r.items()}))
    except ValueError:
        raise HTTPException(422, "CSV contains non-numeric values")
    results = svc.predict(parsed)
    counts: dict = {}
    for r in results:
        counts[r["prediction"]] = counts.get(r["prediction"], 0) + 1
    return {"count": len(results), "class_counts": counts, "results": results[:200]}


@app.get("/api/history")
def get_history():
    return list(history)


@app.delete("/api/history")
def clear_history():
    history.clear()
    return {"cleared": True}
