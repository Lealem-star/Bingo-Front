import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api/client';
import AdminHome from './AdminHome';
import AdminBalance from './AdminBalance';
import AdminStats from './AdminStats';

function AdminNav({ current, onNavigate }) {
    const tabs = [
        { key: 'home', label: 'Home', icon: '🏠' },
        { key: 'balance', label: 'Balance', icon: '💵' },
        { key: 'stats', label: 'Stats', icon: '📊' }
    ];
    return (
        <div className="nav-wrap">
            <nav className="mx-auto max-w-md w-full">
                <ul className="bottom-nav grid grid-cols-3 gap-5 list-none text-[12px] text-pink-200 px-3 py-2 rounded-2xl">
                    {tabs.map(t => (
                        <li key={t.key}>
                            <button
                                type="button"
                                aria-current={current === t.key ? 'page' : undefined}
                                onClick={() => onNavigate?.(t.key)}
                                className={`appearance-none border-0 outline-none w-full px-3 py-2 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 ${current === t.key ? 'bg-pink-400/20 text-white shadow-inner ring-1 ring-pink-300/30' : 'text-pink-300 hover:text-white/90 hover:bg-pink-400/10'}`}
                            >
                                <span aria-hidden className="text-[18px] leading-none">{t.icon}</span>
                                <span className="leading-none">{t.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default function AdminLayout({ onNavigate }) {
    const [tab, setTab] = useState('home');
    const [isAdmin, setIsAdmin] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                // First try to get profile from API
                const profile = await apiFetch('/user/profile');
                setUserProfile(profile);
                // Check if user has admin or super_admin role
                const hasAdminAccess = profile?.role === 'admin' || profile?.role === 'super_admin';
                setIsAdmin(hasAdminAccess);
            } catch (error) {
                console.error('Admin auth error:', error);

                // If API fails, check if we're in Telegram WebApp
                if (window.Telegram?.WebApp?.initData) {
                    console.log('Telegram WebApp detected, retrying auth...');
                    try {
                        // Try to authenticate via Telegram
                        const initData = window.Telegram.WebApp.initData;
                        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                        const res = await fetch(`${apiBase}/auth/telegram/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ initData })
                        });

                        if (res.ok) {
                            const authResult = await res.json();
                            localStorage.setItem('sessionId', authResult.sessionId);
                            localStorage.setItem('user', JSON.stringify(authResult.user));

                            // Now try to get profile again
                            const profile = await apiFetch('/user/profile');
                            setUserProfile(profile);
                            const hasAdminAccess = profile?.role === 'admin' || profile?.role === 'super_admin';
                            setIsAdmin(hasAdminAccess);
                            return;
                        }
                    } catch (telegramError) {
                        console.error('Telegram auth failed:', telegramError);
                    }
                }

                // If all else fails, deny access
                setIsAdmin(false);
            }
        })();
    }, []);

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
                <div className="max-w-md mx-auto p-4 text-white text-center">
                    <div className="mt-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <div>Checking admin access...</div>
                        <div className="text-sm text-white/60 mt-2">
                            {window.Telegram?.WebApp?.initData ? 'Telegram WebApp detected' : 'Direct browser access'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
                <div className="max-w-md mx-auto p-4 text-white text-center">
                    <div className="mt-20">
                        <div className="text-6xl mb-4">🚫</div>
                        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                        <p className="text-white/80 mb-6">You don't have admin privileges to access this panel.</p>
                        <button
                            onClick={() => onNavigate?.('game')}
                            className="bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                        >
                            Go to Game
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            <header className="p-4">
                <div className="app-header">
                    <div className="app-logo">
                        <div className="logo-circle">
                            <img src="/lb.png" alt="Love Bingo Logo" className="logo-image" />
                        </div>
                        <span className="app-title">Admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {userProfile && (
                            <div className="text-white/80 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${userProfile.role === 'super_admin'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                    {userProfile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                </span>
                            </div>
                        )}
                        <button
                            className="rules-button"
                            onClick={() => {
                                // Remove admin parameter and go to game
                                const url = new URL(window.location);
                                url.searchParams.delete('admin');
                                window.history.pushState({}, '', url);
                                onNavigate?.('game');
                            }}
                        >
                            <span className="rules-icon">🎮</span>
                            <span>Game</span>
                        </button>
                    </div>
                </div>
            </header>
            <main>
                {tab === 'home' && <AdminHome />}
                {tab === 'balance' && <AdminBalance />}
                {tab === 'stats' && <AdminStats />}
            </main>
            <AdminNav current={tab} onNavigate={setTab} />
        </div>
    );
}


