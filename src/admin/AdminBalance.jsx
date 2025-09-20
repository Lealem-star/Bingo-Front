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
            <div className="flex justify-between items-center">
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

                {/* Table Header */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-6 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl border-2 border-purple-400/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="font-bold text-white flex items-center gap-3 text-lg">
                        <span className="text-2xl">👤</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Player Name</span>
                    </div>
                    {activeTab === 'deposit' ? (
                        <>
                            <div className="font-bold text-white flex items-center gap-3 text-lg">
                                <span className="text-2xl">💰</span>
                                <span className="bg-green-500/30 px-3 py-1 rounded-full text-sm">Deposit Amount</span>
                            </div>
                            <div className="font-bold text-white flex items-center gap-3 text-lg">
                                <span className="text-2xl">🎁</span>
                                <span className="bg-yellow-500/30 px-3 py-1 rounded-full text-sm">Gift</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="font-bold text-white flex items-center gap-3 text-lg">
                                <span className="text-2xl">💸</span>
                                <span className="bg-orange-500/30 px-3 py-1 rounded-full text-sm">Withdraw Amount</span>
                            </div>
                            <div className="font-bold text-white flex items-center gap-3 text-lg">
                                <span className="text-2xl">🏦</span>
                                <span className="bg-blue-500/30 px-3 py-1 rounded-full text-sm">Account Number</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Table Content */}
                <div className="space-y-4">
                    {activeTab === 'deposit' ? (
                        deposits.length > 0 ? (
                            deposits.map(d => (
                                <div key={d._id} className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm rounded-xl border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="text-sm font-medium truncate flex items-center gap-2">
                                        <span className="text-blue-400">👤</span>
                                        User {d.userId?.slice(-6) || 'Unknown'}
                                    </div>
                                    <div className="text-sm font-bold text-green-400 flex items-center gap-2">
                                        <span>💰</span>
                                        ETB {d.amount}
                                    </div>
                                    <div className="text-sm font-bold text-amber-400 flex items-center gap-2">
                                        <span>🎁</span>
                                        +{Math.floor(d.amount * 0.1)} coins
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-white/60 py-12 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl mb-4">💰</div>
                                <div className="text-lg font-medium mb-2">No deposits found</div>
                                <div className="text-sm">Deposit transactions will appear here</div>
                            </div>
                        )
                    ) : (
                        withdrawals.length > 0 ? (
                            withdrawals.map(w => (
                                <div key={w._id} className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm rounded-xl border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="text-sm font-medium truncate flex items-center gap-2">
                                        <span className="text-blue-400">👤</span>
                                        User {w.userId?.slice(-6) || 'Unknown'}
                                    </div>
                                    <div className="text-sm font-bold text-orange-400 flex items-center gap-2">
                                        <span>💸</span>
                                        ETB {w.amount}
                                    </div>
                                    <div className="text-sm">
                                        <span className={`px-3 py-2 rounded-full text-xs font-medium border ${getStatusColor(w.status)}`}>
                                            {w.status === 'pending' && '⏳'}
                                            {w.status === 'completed' && '✅'}
                                            {w.status === 'cancelled' && '❌'}
                                            {w.status === 'failed' && '⚠️'}
                                            {w.status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-white/60 py-12 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl mb-4">💸</div>
                                <div className="text-lg font-medium mb-2">No withdrawal requests</div>
                                <div className="text-sm">Withdrawal requests will appear here</div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
