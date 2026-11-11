import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function History({ history }) {
  if (history.length === 0) {
    return <p className="muted">Nothing yet. Each prediction you run is listed here.</p>;
  }
  const trend = history.map((h, i) => ({ n: i + 1, confidence: h.confidence }));

  return (
    <>
      {history.length > 1 && trend[0].confidence != null && (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trend} margin={{ left: 0, right: 20, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7dde3" />
            <XAxis dataKey="n" label={{ value: "Prediction #", position: "insideBottom", offset: -2 }} />
            <YAxis domain={[0, 1]} tickFormatter={(v) => `${v * 100}%`} />
            <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
            <Line type="monotone" dataKey="confidence" stroke="#1f6f8b" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      )}
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>#</th>
              {Object.keys(history[0].input).map((k) => <th key={k}>{k}</th>)}
              <th>Prediction</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((h, i) => (
              <tr key={h.id ?? i}>
                <td>{history.length - i}</td>
                {Object.values(h.input).map((v, j) => <td key={j}>{v}</td>)}
                <td><strong>{String(h.prediction)}</strong></td>
                <td>{h.confidence != null ? `${(h.confidence * 100).toFixed(1)}%` : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
