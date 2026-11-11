async function request(path, options) {
  const res = await fetch(`/api${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export const getInfo = () => request("/model-info");
export const getHistory = () => request("/history");
export const clearHistory = () => request("/history", { method: "DELETE" });
export const predict = (features) =>
  request("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features }),
  });
export const predictBatch = (file) => {
  const form = new FormData();
  form.append("file", file);
  return request("/predict/batch", { method: "POST", body: form });
};
