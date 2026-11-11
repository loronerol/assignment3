import { useEffect, useState } from "react";
import * as api from "./api";
import PredictionForm from "./components/PredictionForm.jsx";
import Results from "./components/Results.jsx";
import History from "./components/History.jsx";
import BatchUpload from "./components/BatchUpload.jsx";

export default function App() {
  const [info, setInfo] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getInfo().then(setInfo).catch((e) => setError(`Cannot reach the API: ${e.message}`));
    api.getHistory().then(setHistory).catch(() => {});
  }, []);

  async function run(features) {
    setLoading(true);
    setError("");
    try {
      const r = await api.predict(features);
      setResult(r);
      setHistory((h) => [...h, r]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    await api.clearHistory();
    setHistory([]);
    setResult(null);
  }

  return (
    <main className="shell">
      <header className="top">
        <h1>{info ? info.name : "Model Console"}</h1>
        {info?.metrics?.accuracy != null && (
          <p className="muted">Test accuracy {(info.metrics.accuracy * 100).toFixed(1)}%</p>
        )}
      </header>

      {error && <div className="alert" role="alert">{error}</div>}

      {info && (
        <div className="grid">
          <section className="panel">
            <h2>Enter values</h2>
            <PredictionForm features={info.features} onSubmit={run} loading={loading} />
          </section>

          <section className="panel">
            <h2>Result</h2>
            <Results result={result} importance={info.feature_importance} />
          </section>

          <section className="panel wide">
            <div className="row">
              <h2>Past predictions</h2>
              {history.length > 0 && <button className="link" onClick={reset}>Clear history</button>}
            </div>
            <History history={history} classes={info.classes} />
          </section>

          <section className="panel wide">
            <h2>Predict from a CSV file</h2>
            <BatchUpload features={info.features} />
          </section>
        </div>
      )}
    </main>
  );
}
