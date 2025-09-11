async function reauthenticateAndGetSession() {
    try {
        console.log('Re-authenticating due to 401...');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const initData = window?.Telegram?.WebApp?.initData;

        // Try Telegram auth first
        if (initData) {
            console.log('Attempting Telegram auth...');
            const res = await fetch(`${apiBase}/auth/telegram/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData })
            });
            if (res.ok) {
                const out = await res.json();
                console.log('Telegram auth successful:', out);
                localStorage.setItem('sessionId', out.sessionId);
                localStorage.setItem('user', JSON.stringify(out.user));
                return out.sessionId;
            }
        }

        // Dev fallback
        console.log('Attempting dev fallback auth...');
        const res = await fetch(`${apiBase}/auth/telegram/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ devUserId: '1001' })
        });
        if (res.ok) {
            const out = await res.json();
            console.log('Dev auth successful:', out);
            localStorage.setItem('sessionId', out.sessionId);
            localStorage.setItem('user', JSON.stringify(out.user));
            return out.sessionId;
        } else {
            console.error('Dev auth failed:', res.status, await res.text());
        }
    } catch (e) {
        console.error('Re-authentication error:', e);
    }
    return null;
}

export async function apiFetch(path, { method = 'GET', body, sessionId } = {}) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const doRequest = async (sid) => {
        const headers = { 'Content-Type': 'application/json' };
        if (sid) {
            headers['x-session'] = sid;
            headers['Authorization'] = `Bearer ${sid}`;
        }
        return fetch(`${apiBase}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
    };

    const initialSid = sessionId || localStorage.getItem('sessionId');
    let res = await doRequest(initialSid);
    if (res.status === 401) {
        // Token likely invalid for this environment; re-authenticate and retry once
        const newSid = await reauthenticateAndGetSession();
        if (newSid) {
            res = await doRequest(newSid);
        }
    }
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`API Error ${res.status}:`, errorText);
        throw new Error(`api_error_${res.status}`);
    }
    return res.json();
}


