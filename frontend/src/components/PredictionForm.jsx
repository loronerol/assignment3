import { useState } from "react";

// The form is built from /api/model-info, so a new model needs no frontend edits.
export default function PredictionForm({ features, onSubmit, loading }) {
  const [values, setValues] = useState(
    Object.fromEntries(features.map((f) => [f.name, f.default]))
  );

  const set = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Number(v)])));
      }}
    >
      {features.map((f) => (
        <div className="field" key={f.name}>
          <label htmlFor={f.name}>
            {f.name} {f.unit && <span className="muted">({f.unit})</span>}
          </label>
          <div className="inputs">
            {f.min != null && f.max != null && (
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={0.1}
              value={values[f.name]}
              onChange={(e) => set(f.name, e.target.value)}
              aria-label={`${f.name} slider`}
            />
            )}
            <input
              id={f.name}
              type="number"
              step="any"
              value={values[f.name]}
              onChange={(e) => set(f.name, e.target.value)}
              required
            />
          </div>
        </div>
      ))}
      <button className="primary" disabled={loading}>
        {loading ? "Running model…" : "Run prediction"}
      </button>
    </form>
  );
}
