import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api/client';

export default function AdminBalance() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [activeTab, setActiveTab] = useState('deposit');

    useEffect(() => {
        (async () => {
            const w = await apiFetch('/admin/balances/withdrawals?status=pending');
            setWithdrawals(w.withdrawals || []);
            const d = await apiFetch('/admin/balances/deposits');
            setDeposits(d.deposits || []);
        })();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'completed': return 'bg-green-500/20 text-green-400';
            case 'cancelled': return 'bg-red-500/20 text-red-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="px-6 py-8 space-y-8 text-white">
            {/* Toggle Buttons */}
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={() => setActiveTab('deposit')}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${activeTab === 'deposit'
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xl shadow-emerald-500/40 ring-2 ring-emerald-400'
                        : 'bg-gray-300 text-gray-600 hover:bg-gray-400 border border-gray-400'
                        }`}
                >
                    <span className="flex items-center gap-3">
                        <span className="text-2xl">💰</span>
                        <span>Deposit</span>
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('withdraw')}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${activeTab === 'withdraw'
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xl shadow-red-500/40 ring-2 ring-red-400'
                        : 'bg-gray-300 text-gray-600 hover:bg-gray-400 border border-gray-400'
                        }`}
                >
                    <span className="flex items-center gap-3">
                        <span className="text-2xl">💸</span>
                        <span>Withdraw</span>
                    </span>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm rounded-3xl p-8 border border-white/15 shadow-2xl shadow-purple-500/10">
                <h2 className="text-white text-2xl font-bold mb-8 text-center bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Balance</h2>

                {/* Table Header */}
                <div className="w-full grid grid-cols-3 gap-4 mb-6">
                    <div className="header-button text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">👤</span>
                            <span className="font-semibold">Player Name</span>
                        </div>
                    </div>
                    {activeTab === 'deposit' ? (
                        <>
                            <div className="header-button text-center py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">💰</span>
                                    <span className="font-semibold">Deposit Amount</span>
                                </div>
                            </div>
                            <div className="header-button text-center py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">🎁</span>
                                    <span className="font-semibold">Gift</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="header-button text-center py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">💸</span>
                                    <span className="font-semibold">Withdraw Amount</span>
                                </div>
                            </div>
                            <div className="header-button text-center py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">🏦</span>
                                    <span className="font-semibold">Account Number</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Table Content */}
                <div className="space-y-4">
                    {(activeTab === 'deposit' ? deposits : withdrawals).map(transaction => (
                        <div key={transaction._id} className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm rounded-xl border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-sm font-medium truncate flex items-center gap-2">
                                <span className="text-blue-400">👤</span>
                                User {transaction.userId?.slice(-6) || 'Unknown'}
                            </div>
                            {activeTab === 'deposit' ? (
                                <>
                                    <div className="text-sm font-bold text-green-400 flex items-center gap-2">
                                        <span>💰</span>
                                        ETB {transaction.amount}
                                    </div>
                                    <div className="text-sm font-bold text-amber-400 flex items-center gap-2">
                                        <span>🎁</span>
                                        +{Math.floor(transaction.amount * 0.1)} coins
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-sm font-bold text-orange-400 flex items-center gap-2">
                                        <span>💸</span>
                                        ETB {transaction.amount}
                                    </div>
                                    <div className="text-sm">
                                        <span className={`px-3 py-2 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                                            {transaction.status === 'pending' && '⏳'}
                                            {transaction.status === 'completed' && '✅'}
                                            {transaction.status === 'cancelled' && '❌'}
                                            {transaction.status === 'failed' && '⚠️'}
                                            {transaction.status || 'pending'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {(activeTab === 'deposit' ? deposits : withdrawals).length === 0 && (
                        <div className="text-center text-white/60 py-12 bg-white/5 rounded-2xl border border-white/10">
                            <div className="text-4xl mb-4">{activeTab === 'deposit' ? '💰' : '💸'}</div>
                            <div className="text-lg font-medium mb-2">
                                {activeTab === 'deposit' ? 'No deposits found' : 'No withdrawal requests'}
                            </div>
                            <div className="text-sm">
                                {activeTab === 'deposit' ? 'Deposit transactions will appear here' : 'Withdrawal requests will appear here'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
