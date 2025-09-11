import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';

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

async function fetchProfileWithSession(sessionId) {
    if (!sessionId) return null;
    try {
        return await apiFetch('/user/profile', { sessionId });
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId'));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    });

    useEffect(() => {
        (async () => {
            if (sessionId && user) {
                // Try to hydrate missing fields (phone/isRegistered) in background
                try {
                    if (!user.phone || user.isRegistered === false) {
                        const prof = await fetchProfileWithSession(sessionId);
                        if (prof?.user) {
                            const merged = { ...user, ...{ firstName: prof.user.firstName, lastName: prof.user.lastName, phone: prof.user.phone, isRegistered: prof.user.isRegistered } };
                            setUser(merged);
                            localStorage.setItem('user', JSON.stringify(merged));
                        }
                    }
                } catch { }
                return;
            }
            const initData = window?.Telegram?.WebApp?.initData;
            try {
                const out = await verifyTelegram(initData);
                setSessionId(out.sessionId);
                localStorage.setItem('sessionId', out.sessionId);
                // Hydrate profile to ensure phone/isRegistered available
                let mergedUser = out.user;
                try {
                    const prof = await fetchProfileWithSession(out.sessionId);
                    if (prof?.user) {
                        mergedUser = { ...mergedUser, ...{ firstName: prof.user.firstName, lastName: prof.user.lastName, phone: prof.user.phone, isRegistered: prof.user.isRegistered } };
                    }
                } catch { }
                setUser(mergedUser);
                localStorage.setItem('user', JSON.stringify(mergedUser));
            } catch (e) {
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
                    localStorage.setItem('sessionId', out.sessionId);
                    // Hydrate profile
                    let mergedUser = out.user;
                    try {
                        const prof = await fetchProfileWithSession(out.sessionId);
                        if (prof?.user) {
                            mergedUser = { ...mergedUser, ...{ firstName: prof.user.firstName, lastName: prof.user.lastName, phone: prof.user.phone, isRegistered: prof.user.isRegistered } };
                        }
                    } catch { }
                    setUser(mergedUser);
                    localStorage.setItem('user', JSON.stringify(mergedUser));
                }
            }
        })();
    }, [sessionId, user]);

    const value = useMemo(() => ({ sessionId, user, setSessionId }), [sessionId, user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }


