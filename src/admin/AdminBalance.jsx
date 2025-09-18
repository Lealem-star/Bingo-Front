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
        <div className="p-4 space-y-4 text-white">
            {/* Main Content Area */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-lg">
                {/* Toggle Buttons */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('deposit')}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'deposit'
                            ? 'bg-amber-500 text-white shadow-lg ring-2 ring-amber-300'
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                            }`}
                    >
                        Deposit
                    </button>
                    <button
                        onClick={() => setActiveTab('withdraw')}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'withdraw'
                            ? 'bg-amber-500 text-white shadow-lg ring-2 ring-amber-300'
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                            }`}
                    >
                        Withdraw
                    </button>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white/10 rounded-lg">
                    <div className="font-semibold text-amber-400">Name Player</div>
                    {activeTab === 'deposit' ? (
                        <>
                            <div className="font-semibold text-amber-400">Deposit Amount</div>
                            <div className="font-semibold text-amber-400">Gift</div>
                        </>
                    ) : (
                        <>
                            <div className="font-semibold text-amber-400">Withdraw Amount Request</div>
                            <div className="font-semibold text-amber-400">Account Number</div>
                        </>
                    )}
                </div>

                {/* Table Content */}
                <div className="space-y-2">
                    {activeTab === 'deposit' ? (
                        deposits.length > 0 ? (
                            deposits.map(d => (
                                <div key={d._id} className="grid grid-cols-3 gap-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-sm truncate">User {d.userId?.slice(-6) || 'Unknown'}</div>
                                    <div className="text-sm font-medium">ETB {d.amount}</div>
                                    <div className="text-sm text-green-400">+{Math.floor(d.amount * 0.1)} coins</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-white/60 py-8">No deposits found</div>
                        )
                    ) : (
                        withdrawals.length > 0 ? (
                            withdrawals.map(w => (
                                <div key={w._id} className="grid grid-cols-3 gap-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-sm truncate">User {w.userId?.slice(-6) || 'Unknown'}</div>
                                    <div className="text-sm font-medium">ETB {w.amount}</div>
                                    <div className="text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(w.status)}`}>
                                            {w.status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-white/60 py-8">No withdrawal requests found</div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
