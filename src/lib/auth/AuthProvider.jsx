import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({ sessionId: null, user: null, setSessionId: () => { } });

async function verifyTelegram(initData) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiBase}/auth/telegram/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData })
    });
    if (!res.ok) throw new Error('verify_failed');
    return res.json();
}

export function AuthProvider({ children }) {
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId'));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    });

    useEffect(() => {
        (async () => {
            if (sessionId && user) return;
            const initData = window?.Telegram?.WebApp?.initData;
            try {
                const out = await verifyTelegram(initData);
                setSessionId(out.sessionId);
                setUser(out.user);
                localStorage.setItem('sessionId', out.sessionId);
                localStorage.setItem('user', JSON.stringify(out.user));
            } catch {
                // fallback dev session
                const devUserId = '1001';
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiBase}/auth/telegram/verify`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ devUserId })
                });
                if (res.ok) {
                    const out = await res.json();
                    setSessionId(out.sessionId);
                    setUser(out.user);
                    localStorage.setItem('sessionId', out.sessionId);
                    localStorage.setItem('user', JSON.stringify(out.user));
                }
            }
        })();
    }, [sessionId, user]);

    const value = useMemo(() => ({ sessionId, user, setSessionId }), [sessionId, user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }


