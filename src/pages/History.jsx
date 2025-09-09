import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth/AuthProvider';
import { apiFetch } from '../lib/api/client';

export default function History({ onNavigate }) {
    const { sessionId } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!sessionId) return;
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const data = await apiFetch('/user/transactions', { sessionId });
                setTransactions(data.transactions || []);
            } catch (error) {
                console.error('Failed to fetch transaction history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [sessionId]);

    const filteredTransactions = transactions.filter(transaction => {
        if (activeTab === 'all') return true;
        if (activeTab === 'deposits') return transaction.type === 'deposit';
        if (activeTab === 'games') return ['game_bet', 'game_win'].includes(transaction.type);
        return true;
    });

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit': return '💰';
            case 'game_win': return '🏆';
            case 'game_bet': return '🎮';
            case 'coin_conversion': return '🔄';
            default: return '📝';
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case 'deposit': return 'text-green-400';
            case 'game_win': return 'text-yellow-400';
            case 'game_bet': return 'text-red-400';
            case 'coin_conversion': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            <header className="p-6 pt-16 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">📜 Transaction History</h1>
                <p className="text-sm text-pink-300">Your Love Bingo Journey</p>
            </header>

            <main className="p-6 space-y-6">
                {/* Filter Tabs */}
                <div className="flex gap-2 bg-slate-800/40 rounded-lg p-1 border border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'all'
                                ? 'bg-pink-500 text-white'
                                : 'text-slate-300 hover:text-white'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('deposits')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'deposits'
                                ? 'bg-pink-500 text-white'
                                : 'text-slate-300 hover:text-white'
                            }`}
                    >
                        Deposits
                    </button>
                    <button
                        onClick={() => setActiveTab('games')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'games'
                                ? 'bg-pink-500 text-white'
                                : 'text-slate-300 hover:text-white'
                            }`}
                    >
                        Games
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-6 border border-pink-200 shadow-lg">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                <span className="text-white text-2xl">📜</span>
                            </div>
                            <h3 className="text-pink-800 font-semibold text-lg mb-2">No Transactions Yet</h3>
                            <p className="text-pink-700">Your transaction history will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTransactions.map((transaction) => (
                            <div key={transaction.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-700/60 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg">{getTransactionIcon(transaction.type)}</span>
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{transaction.description}</div>
                                            <div className="text-slate-400 text-sm">
                                                {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                                        {transaction.amount > 0 ? '+' : ''}ETB {Math.abs(transaction.amount)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <BottomNav current="history" onNavigate={onNavigate} />
        </div>
    );
}

