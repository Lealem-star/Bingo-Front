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
    useEffect(() => {
        (async () => {
            try {
                const profile = await apiFetch('/user/profile');
                setIsAdmin(profile?.role === 'admin');
            } catch { setIsAdmin(false); }
        })();
    }, []);

    if (isAdmin === null) return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900"><div className="max-w-md mx-auto p-4 text-white">Checking admin...</div></div>;
    if (!isAdmin) return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900"><div className="max-w-md mx-auto p-4 text-white">Unauthorized</div></div>;

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
                    <button className="rules-button" onClick={() => onNavigate?.('game')}>
                        <span className="rules-icon">🎮</span>
                        <span>Game</span>
                    </button>
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


