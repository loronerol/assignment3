import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const ACCENT = "#1f6f8b";
const MUTED = "#b9c4cf";

export default function Results({ result, importance }) {
  if (!result) {
    return <p className="muted">Enter values and run a prediction to see the result here.</p>;
  }
  const probs = Object.entries(result.probabilities || {}).map(([name, value]) => ({ name, value }));
  const imp = Object.entries(importance || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <p className="answer">{String(result.prediction)}</p>
      {result.confidence != null && (
        <p className="muted">Confidence {(result.confidence * 100).toFixed(1)}%</p>
      )}

      {probs.length > 0 && (
        <>
          <h3>Probability by class</h3>
          <ResponsiveContainer width="100%" height={40 + probs.length * 34}>
            <BarChart data={probs} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${v * 100}%`} />
              <YAxis type="category" dataKey="name" width={90} />
              <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {probs.map((p) => (
                  <Cell key={p.name} fill={p.name === result.prediction ? ACCENT : MUTED} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      {imp.length > 0 && (
        <>
          <h3>Which inputs matter most (whole model)</h3>
          <ResponsiveContainer width="100%" height={40 + imp.length * 30}>
            <BarChart data={imp} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tickFormatter={(v) => `${Math.round(v * 100)}%`} />
              <YAxis type="category" dataKey="name" width={110} />
              <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
              <Bar dataKey="value" fill="#c98a1b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
