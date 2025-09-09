export async function apiFetch(path, { method = 'GET', body, sessionId } = {}) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const headers = { 'Content-Type': 'application/json' };
    if (sessionId) headers['x-session'] = sessionId;
    const res = await fetch(`${apiBase}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`api_error_${res.status}`);
    return res.json();
}


