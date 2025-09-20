import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api/client';

export default function AdminBalance() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [users, setUsers] = useState({}); // Store user data by userId
    const [activeTab, setActiveTab] = useState('deposit');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        (async () => {
            const w = await apiFetch('/admin/balances/withdrawals?status=pending');
            const d = await apiFetch('/admin/balances/deposits');

            setWithdrawals(w.withdrawals || []);
            setDeposits(d.deposits || []);

            // Fetch user data for all unique user IDs
            const allUserIds = new Set();
            [...(w.withdrawals || []), ...(d.deposits || [])].forEach(transaction => {
                if (transaction.userId) allUserIds.add(transaction.userId);
            });

            // Fetch user details for each unique user ID
            const userPromises = Array.from(allUserIds).map(async (userId) => {
                try {
                    const userData = await apiFetch(`/user/${userId}`);
                    return { userId, userData };
                } catch (error) {
                    console.error(`Failed to fetch user ${userId}:`, error);
                    return { userId, userData: null };
                }
            });

            const userResults = await Promise.all(userPromises);
            const usersMap = {};
            userResults.forEach(({ userId, userData }) => {
                if (userData) {
                    usersMap[userId] = userData;
                }
            });
            setUsers(usersMap);
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

    // Get user display name
    const getUserDisplayName = (userId) => {
        const user = users[userId];
        if (!user) return `User ${userId?.slice(-6) || 'Unknown'}`;

        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const username = user.username ? `@${user.username}` : '';

        // Combine name parts, prioritizing full name over username
        if (firstName || lastName) {
            const fullName = `${firstName} ${lastName}`.trim();
            return username ? `${fullName} (${username})` : fullName;
        }

        return username || `User ${userId?.slice(-6) || 'Unknown'}`;
    };

    // Filter transactions based on search term (by user name)
    const filterTransactions = (transactions) => {
        if (!searchTerm.trim()) return transactions;

        return transactions.filter(transaction => {
            const displayName = getUserDisplayName(transaction.userId);
            return displayName.toLowerCase().includes(searchTerm.toLowerCase());
        });
    };

    // Get filtered transactions for current tab
    const getFilteredTransactions = () => {
        const transactions = activeTab === 'deposit' ? deposits : withdrawals;
        return filterTransactions(transactions);
    };

    return (
        <div className="px-6 py-8 space-y-8 text-white">
            {/* Header with Logo and Search */}
            <div className="flex justify-between items-center mb-6">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <img src="/lb.png" alt="Love Bingo Logo" className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold text-white">Admin Panel</span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by user name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
                        🔍
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

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
                    {(() => {
                        const filteredTransactions = getFilteredTransactions();
                        const allTransactions = activeTab === 'deposit' ? deposits : withdrawals;

                        if (filteredTransactions.length > 0) {
                            return filteredTransactions.map(transaction => (
                                <div key={transaction._id} className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm rounded-xl border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="text-sm font-medium truncate flex items-center gap-2">
                                        <span className="text-blue-400">👤</span>
                                        {getUserDisplayName(transaction.userId)}
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
                            ));
                        } else if (searchTerm.trim()) {
                            return (
                                <div className="text-center text-white/60 py-12 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <div className="text-lg font-medium mb-2">No results found</div>
                                    <div className="text-sm">No transactions match "{searchTerm}"</div>
                                </div>
                            );
                        } else if (allTransactions.length === 0) {
                            return (
                                <div className="text-center text-white/60 py-12 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-4xl mb-4">{activeTab === 'deposit' ? '💰' : '💸'}</div>
                                    <div className="text-lg font-medium mb-2">
                                        {activeTab === 'deposit' ? 'No deposits found' : 'No withdrawal requests'}
                                    </div>
                                    <div className="text-sm">
                                        {activeTab === 'deposit' ? 'Deposit transactions will appear here' : 'Withdrawal requests will appear here'}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>
        </div>
    );
}
