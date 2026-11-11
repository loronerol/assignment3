import json
from pathlib import Path
import joblib
import numpy as np

BASE = Path(__file__).parent / "model"


def _final_step(model):
    return model.steps[-1][1] if hasattr(model, "steps") else model


def _infer_meta(model) -> dict:
    """Build the form/chart description straight from a fitted scikit-learn model."""
    est = _final_step(model)
    names = getattr(model, "feature_names_in_", None)
    if names is None:
        n = getattr(model, "n_features_in_", None) or getattr(est, "n_features_in_", 1)
        names = [f"feature_{i + 1}" for i in range(n)]
    classes = [str(c) for c in getattr(model, "classes_", [])]
    meta = {
        "name": type(est).__name__,
        "task": "classification" if classes else "regression",
        "classes": classes,
        "features": [{"name": str(n), "default": 0} for n in names],
    }
    imp = getattr(est, "feature_importances_", None)
    if imp is not None and len(imp) == len(names):
        meta["feature_importance"] = {str(n): round(float(v), 4) for n, v in zip(names, imp)}
    return meta


class ModelService:
    """Loads your trained model once at startup and wraps inference."""

    def __init__(self):
        files = sorted(p for p in BASE.glob("model.*") if p.suffix in {".joblib", ".pkl", ".pickle"})
        if not files:
            raise RuntimeError("Put your trained model in backend/model/ as model.joblib (or model.pkl).")
        self.model = joblib.load(files[0])
        meta_path = BASE / "meta.json"
        # meta.json is optional: it overrides anything inferred from the model
        self.meta = {**_infer_meta(self.model),
                     **(json.loads(meta_path.read_text()) if meta_path.exists() else {})}
        self.names = [f["name"] for f in self.meta["features"]]

    def predict(self, rows):
        X = np.asarray(rows, dtype=float)
        if hasattr(self.model, "feature_names_in_"):       # model was fitted on a DataFrame
            import pandas as pd
            X = pd.DataFrame(X, columns=self.model.feature_names_in_)
        preds = self.model.predict(X)
        proba = self.model.predict_proba(X) if hasattr(self.model, "predict_proba") else None
        classes = self.meta["classes"]
        order = [str(c) for c in getattr(self.model, "classes_", [])]
        results = []
        for i, p in enumerate(preds):
            item = {"prediction": str(p) if self.meta["task"] == "classification" else float(p)}
            if proba is not None:
                item["probabilities"] = {classes[j]: round(float(proba[i][j]), 4) for j in range(len(order))}
                item["confidence"] = round(float(proba[i].max()), 4)
            results.append(item)
        return results
