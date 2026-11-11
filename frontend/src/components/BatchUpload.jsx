import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { predictBatch } from "../api";

export default function BatchUpload({ features }) {
  const [out, setOut] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setOut(await predictBatch(file));
    } catch (err) {
      setOut(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const data = out ? Object.entries(out.class_counts).map(([name, count]) => ({ name, count })) : [];

  return (
    <div>
      <p className="muted">
        Upload a CSV with a header row containing: {features.map((f) => f.name).join(", ")}.
      </p>
      <input type="file" accept=".csv" onChange={onFile} disabled={busy} />
      {error && <div className="alert" role="alert">{error}</div>}
      {out && (
        <>
          <h3>{out.count} rows classified</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1f6f8b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
