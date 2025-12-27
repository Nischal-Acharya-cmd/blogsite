const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path: string, opts: any = {}) {
  const headers: Record<string, string> = opts.headers || {};
  if (!headers['Content-Type'] && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('adminToken');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + path, { ...opts, headers });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw data || { error: 'Request failed' };
  return data;
}

export const api = {
  get: (p: string) => request(p, { method: 'GET' }),
  post: (p: string, body?: any) => request(p, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (p: string, body?: any) => request(p, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  del: (p: string) => request(p, { method: 'DELETE' }),
};

export default api;
