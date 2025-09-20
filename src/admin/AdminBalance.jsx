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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Premium Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20"></div>
                <div className="relative px-4 py-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-white to-purple-100 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                                    <img src="/lb.png" alt="Love Bingo Logo" className="w-10 h-10" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                                    Admin Panel
                                </h1>
                                <p className="text-purple-200 text-sm font-medium">Transaction Management</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-80">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by user name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-5 py-3 pl-12 pr-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 shadow-lg"
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Toggle Buttons */}
            <div className="px-4 mb-8">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-2 border border-white/10 shadow-2xl">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setActiveTab('deposit')}
                            className={`relative px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 active:scale-95 overflow-hidden ${activeTab === 'deposit'
                                ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-2xl shadow-emerald-500/50'
                                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                                }`}
                        >
                            {activeTab === 'deposit' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                            )}
                            <span className="relative flex items-center justify-center gap-3">
                                <span className="text-2xl">💰</span>
                                <span>Deposits</span>
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('withdraw')}
                            className={`relative px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 active:scale-95 overflow-hidden ${activeTab === 'withdraw'
                                ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl shadow-red-500/50'
                                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                                }`}
                        >
                            {activeTab === 'withdraw' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                            )}
                            <span className="relative flex items-center justify-center gap-3">
                                <span className="text-2xl">💸</span>
                                <span>Withdrawals</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Main Content */}
            <div className="px-4 pb-8">
                <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Premium Table Header */}
                    <div className="bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 backdrop-blur-xl border-b border-white/20">
                        <div className="grid grid-cols-3 gap-4 p-6">
                            <div className="flex items-center justify-center gap-3 text-white">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span className="font-bold text-lg">Player Name</span>
                            </div>
                            {activeTab === 'deposit' ? (
                                <>
                                    <div className="flex items-center justify-center gap-3 text-white">
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-lg">Amount</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-3 text-white">
                                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-lg">Bonus</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center gap-3 text-white">
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-lg">Amount</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-3 text-white">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-lg">Status</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Premium Transaction Cards */}
                    <div className="p-6 space-y-3">
                        {(() => {
                            const filteredTransactions = getFilteredTransactions();
                            const allTransactions = activeTab === 'deposit' ? deposits : withdrawals;

                            if (filteredTransactions.length > 0) {
                                return filteredTransactions.map((transaction, index) => (
                                    <div key={transaction._id} className="group relative overflow-hidden">
                                        <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:border-white/30">
                                            <div className="grid grid-cols-3 gap-4 p-6">
                                                {/* Player Name */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-white font-semibold text-sm truncate">
                                                            {getUserDisplayName(transaction.userId)}
                                                        </p>
                                                        <p className="text-white/60 text-xs">Player</p>
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className={`text-lg font-bold ${activeTab === 'deposit' ? 'text-green-400' : 'text-orange-400'}`}>
                                                            ETB {transaction.amount}
                                                        </div>
                                                        <div className="text-white/60 text-xs">
                                                            {activeTab === 'deposit' ? 'Deposit' : 'Withdrawal'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bonus/Status */}
                                                <div className="flex items-center justify-center">
                                                    {activeTab === 'deposit' ? (
                                                        <div className="text-center">
                                                            <div className="text-amber-400 font-bold text-lg">
                                                                +{Math.floor(transaction.amount * 0.1)}
                                                            </div>
                                                            <div className="text-white/60 text-xs">Bonus Coins</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 ${getStatusColor(transaction.status)}`}>
                                                                {transaction.status === 'pending' && '⏳ Pending'}
                                                                {transaction.status === 'completed' && '✅ Completed'}
                                                                {transaction.status === 'cancelled' && '❌ Cancelled'}
                                                                {transaction.status === 'failed' && '⚠️ Failed'}
                                                                {!transaction.status && '⏳ Pending'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Hover Effect Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                                        </div>
                                    </div>
                                ));
                            } else if (searchTerm.trim()) {
                                return (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
                                        <p className="text-white/60">No transactions match "{searchTerm}"</p>
                                    </div>
                                );
                            } else if (allTransactions.length === 0) {
                                return (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {activeTab === 'deposit' ? 'No Deposits Yet' : 'No Withdrawals Yet'}
                                        </h3>
                                        <p className="text-white/60">
                                            {activeTab === 'deposit' ? 'Deposit transactions will appear here' : 'Withdrawal requests will appear here'}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
