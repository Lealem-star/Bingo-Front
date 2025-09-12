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
    const [isLoading, setIsLoading] = useState(true);

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
            // Support both SDK initData and URL param fallback (tgWebAppData)
            const initData = window?.Telegram?.WebApp?.initData || new URLSearchParams(window.location.search).get('tgWebAppData');
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
                // No fallback for production - require valid Telegram data
                console.error('Telegram authentication failed:', e);
                setSessionId(null);
                setUser(null);
                localStorage.removeItem('sessionId');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [sessionId, user]);

    const value = useMemo(() => ({ sessionId, user, setSessionId, isLoading }), [sessionId, user, isLoading]);

    // Show loading state while authenticating
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
                    <div className="text-white text-lg">Authenticating...</div>
                </div>
            </div>
        );
    }

    // Show error message if no valid Telegram data
    if (!sessionId || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h1 className="text-white text-2xl font-bold mb-4">Access Restricted</h1>
                    <p className="text-white/80 mb-6">
                        This application can only be accessed through Telegram. Please open this app from within the Telegram bot.
                    </p>
                    <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-white text-sm">
                            <strong>How to access:</strong><br />
                            1. Open the Love Bingo bot in Telegram<br />
                            2. Click the "Play" button<br />
                            3. The web app will open automatically
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }


