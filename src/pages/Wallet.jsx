import React, { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth/AuthProvider.jsx';
import { apiFetch } from '../lib/api/client.js';

export default function Wallet({ onNavigate }) {
    const { sessionId, user } = useAuth();
    const [wallet, setWallet] = useState({ main: 0, play: 0, coins: 0 });
    const [coins, setCoins] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('balance');
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (!sessionId) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const walletData = await apiFetch('/wallet', { sessionId });
                setWallet(walletData);

                if (activeTab === 'history') {
                    const transactionData = await apiFetch('/user/transactions', { sessionId });
                    setTransactions(transactionData.transactions || []);
                }
            } catch (error) {
                console.error('Failed to fetch wallet data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sessionId, activeTab]);

    const convert = async () => {
        if (!sessionId) return;
        const amt = Number(coins || 0);
        if (!amt) return;
        try {
            const out = await apiFetch('/wallet/convert', { method: 'POST', body: { coins: amt }, sessionId });
            setWallet(out.wallet);
            setCoins('');
        } catch { }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            {/* Header */}
            <header className="p-4 pt-16">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Wallet</h1>
                    <button className="text-gray-300 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="p-4 space-y-4">
                {/* User Info Section */}
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">👤</span>
                            </div>
                            <span className="text-white font-medium">{user?.phone || 'Not registered'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-600 px-3 py-1 rounded-full">
                            <span className="text-white text-sm">✓</span>
                            <span className="text-white text-sm font-medium">Verified</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('balance')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'balance'
                                    ? 'bg-slate-700/60 text-white'
                                    : 'bg-transparent text-slate-300'
                                }`}
                        >
                            Balance
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'history'
                                    ? 'bg-slate-700/60 text-white'
                                    : 'bg-transparent text-slate-300'
                                }`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
                    </div>
                ) : activeTab === 'balance' ? (
                    /* Wallet Balances */
                    <div className="space-y-3">
                        {/* Main Wallet */}
                        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Main Wallet</span>
                                <span className="text-white font-bold">ETB {wallet.main}</span>
                            </div>
                        </div>

                        {/* Play Wallet */}
                        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-300">Play Wallet</span>
                                    <span className="text-green-400 text-sm">🔗</span>
                                </div>
                                <span className="text-green-400 font-bold">ETB {wallet.play}</span>
                            </div>
                        </div>

                        {/* Coins */}
                        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-300">Coins</span>
                                    <span className="text-yellow-400 text-sm">🪙</span>
                                </div>
                                <span className="text-white font-bold">{wallet.coins}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Transaction History */
                    <div className="space-y-3">
                        {transactions.length === 0 ? (
                            <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-700/50 text-center">
                                <div className="text-slate-400 text-lg mb-2">📝</div>
                                <div className="text-slate-300">No transactions yet</div>
                            </div>
                        ) : (
                            transactions.map((transaction) => (
                                <div key={transaction.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${transaction.type === 'deposit' ? 'bg-green-600' :
                                                    transaction.type === 'game_win' ? 'bg-yellow-600' :
                                                        transaction.type === 'game_bet' ? 'bg-red-600' :
                                                            'bg-blue-600'
                                                }`}>
                                                <span className="text-white text-sm">
                                                    {transaction.type === 'deposit' ? '💰' :
                                                        transaction.type === 'game_win' ? '🏆' :
                                                            transaction.type === 'game_bet' ? '🎮' :
                                                                '🔄'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{transaction.description}</div>
                                                <div className="text-slate-400 text-sm">
                                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {transaction.amount > 0 ? '+' : ''}ETB {transaction.amount}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Convert Section */}
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                    <input
                        value={coins}
                        onChange={(e) => setCoins(e.target.value)}
                        className="w-full rounded-lg bg-slate-900/60 px-4 py-3 border border-slate-700/60 text-white placeholder-slate-400 mb-3"
                        placeholder="Enter coins to convert"
                    />
                    <button
                        onClick={convert}
                        className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <span>↓</span>
                        <span>Convert Coin</span>
                    </button>
                </div>
            </main>
            <BottomNav current="wallet" onNavigate={onNavigate} />
        </div>
    );
}

