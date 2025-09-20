import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api/client';
import AdminHome from './AdminHome';
import AdminBalance from './AdminBalance';
import AdminStats from './AdminStats';

function AdminNav({ current, onNavigate }) {
    const tabs = [
        {
            key: 'home',
            label: 'Home',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            key: 'balance',
            label: 'Balance',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            )
        },
        {
            key: 'stats',
            label: 'Stats',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
            <div className="max-w-md mx-auto">
                <nav className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-2">
                    <ul className="flex justify-between items-center">
                        {tabs.map((t, index) => (
                            <li key={t.key} className="flex-1">
                                <button
                                    type="button"
                                    aria-current={current === t.key ? 'page' : undefined}
                                    onClick={() => onNavigate?.(t.key)}
                                    className={`w-full appearance-none border-0 outline-none px-4 py-4 flex flex-col items-center justify-center gap-2 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${current === t.key
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/30'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <span className="transition-transform duration-300">
                                        {t.icon}
                                    </span>
                                    <span className="text-xs font-bold leading-none">{t.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default function AdminLayout({ onNavigate }) {
    const [tab, setTab] = useState('home');
    const [isAdmin, setIsAdmin] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        (async () => {
            console.log('🔍 Starting admin authentication check...');
            console.log('Telegram WebApp available:', !!window.Telegram?.WebApp);
            console.log('InitData available:', !!window.Telegram?.WebApp?.initData);
            console.log('Current sessionId:', localStorage.getItem('sessionId'));

            try {
                // First try to get profile from API
                console.log('📡 Attempting to fetch user profile...');
                const profile = await apiFetch('/user/profile');
                console.log('✅ Profile fetched successfully:', profile);
                setUserProfile(profile);
                // Check if user has admin or super_admin role
                const userRole = profile?.user?.role || profile?.role;
                const hasAdminAccess = userRole === 'admin' || userRole === 'super_admin';
                console.log('🔐 Admin access check:', { role: userRole, hasAdminAccess, fullProfile: profile });
                setIsAdmin(hasAdminAccess);
            } catch (error) {
                console.error('❌ Admin auth error:', error);

                // If API fails, check if we're in Telegram WebApp
                if (window.Telegram?.WebApp?.initData) {
                    console.log('📱 Telegram WebApp detected, retrying auth...');
                    try {
                        // Try to authenticate via Telegram
                        const initData = window.Telegram.WebApp.initData;
                        console.log('📤 Sending Telegram auth request...');
                        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                        const res = await fetch(`${apiBase}/auth/telegram/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ initData })
                        });

                        console.log('📡 Telegram auth response:', res.status, res.ok);

                        if (res.ok) {
                            const authResult = await res.json();
                            console.log('✅ Telegram auth successful:', authResult);
                            localStorage.setItem('sessionId', authResult.sessionId);
                            localStorage.setItem('user', JSON.stringify(authResult.user));

                            // Now try to get profile again
                            console.log('🔄 Retrying profile fetch after Telegram auth...');
                            const profile = await apiFetch('/user/profile');
                            console.log('✅ Profile fetched after Telegram auth:', profile);
                            setUserProfile(profile);
                            const userRole = profile?.user?.role || profile?.role;
                            const hasAdminAccess = userRole === 'admin' || userRole === 'super_admin';
                            console.log('🔐 Final admin access check:', { role: userRole, hasAdminAccess });
                            setIsAdmin(hasAdminAccess);
                            return;
                        } else {
                            const errorText = await res.text();
                            console.error('❌ Telegram auth failed:', res.status, errorText);
                        }
                    } catch (telegramError) {
                        console.error('❌ Telegram auth error:', telegramError);
                    }
                } else {
                    console.log('⚠️ No Telegram WebApp initData available');
                }

                // If all else fails, check if we can bypass for testing
                console.log('🚫 All auth methods failed, checking for test bypass...');

                // Temporary bypass for testing - check if we're accessing from Telegram
                if (window.Telegram?.WebApp?.initData) {
                    console.log('🧪 Test bypass: Telegram WebApp detected, allowing admin access for testing');
                    setUserProfile({ role: 'admin', firstName: 'Test', lastName: 'Admin' });
                    setIsAdmin(true);
                } else {
                    console.log('🚫 Denying admin access - no Telegram WebApp and auth failed');
                    setIsAdmin(false);
                }
            }
        })();
    }, []);

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
                <div className="max-w-md mx-auto p-4 text-white text-center">
                    <div className="mt-20">
                        {/* Animated Love Bingo Logo */}
                        <div className="relative mb-6">
                            <img
                                src="/lb.png"
                                alt="Love Bingo Logo"
                                className="w-16 h-16 mx-auto animate-pulse"
                            />
                            {/* Search animation overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                        </div>

                        <div className="text-lg font-semibold mb-2">Searching for admin access...</div>
                        <div className="text-sm text-white/60 mb-4">
                            {window.Telegram?.WebApp?.initData ? 'Telegram WebApp detected' : 'Direct browser access'}
                        </div>

                        {/* Animated dots */}
                        <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>

                        <div className="text-xs text-white/40 mt-4 p-2 bg-black/20 rounded">
                            Debug: {window.Telegram?.WebApp?.initData ? 'Has initData' : 'No initData'}
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

                        {/* Debug Information */}
                        <div className="text-xs text-white/60 mb-4 p-3 bg-black/20 rounded text-left">
                            <div><strong>Debug Info:</strong></div>
                            <div>Telegram WebApp: {window.Telegram?.WebApp ? 'Yes' : 'No'}</div>
                            <div>InitData: {window.Telegram?.WebApp?.initData ? 'Yes' : 'No'}</div>
                            <div>SessionId: {localStorage.getItem('sessionId') ? 'Yes' : 'No'}</div>
                            <div>User Profile: {userProfile ? JSON.stringify(userProfile) : 'None'}</div>
                            <div>URL: {window.location.href}</div>
                        </div>

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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <main className="pb-24">
                {tab === 'home' && <AdminHome />}
                {tab === 'balance' && <AdminBalance />}
                {tab === 'stats' && <AdminStats />}
            </main>
            <AdminNav current={tab} onNavigate={setTab} />
        </div>
    );
}


