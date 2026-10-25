// All calls go through /api, which Vite forwards to the Express server.
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

// Sends a file (FormData) to the server. The browser sets the multipart headers itself.
export async function upload(path, formData) {
  const res = await fetch('/api' + path, { method: 'POST', credentials: 'include', body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed.');
  return data;
}

export async function uploadImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  const data = await upload('/uploads/image', fd);
  return data.url;
}
