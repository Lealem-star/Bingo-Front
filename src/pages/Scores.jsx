import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth/AuthProvider';
import { apiFetch } from '../lib/api/client';

export default function Scores({ onNavigate }) {
    const { sessionId, user } = useAuth();
    const [userStats, setUserStats] = useState({
        totalGamesPlayed: 0,
        totalGamesWon: 0,
        totalWinnings: 0,
        winRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sessionId) return;
        const fetchUserStats = async () => {
            try {
                setLoading(true);
                const data = await apiFetch('/user/profile', { sessionId });
                const stats = data.user;
                setUserStats({
                    totalGamesPlayed: stats.totalGamesPlayed || 0,
                    totalGamesWon: stats.totalGamesWon || 0,
                    totalWinnings: stats.totalWinnings || 0,
                    winRate: stats.totalGamesPlayed > 0 ? Math.round((stats.totalGamesWon / stats.totalGamesPlayed) * 100) : 0
                });
            } catch (error) {
                console.error('Failed to fetch user stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserStats();
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            <header className="p-6 pt-16 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">🏆 Your Stats</h1>
                <p className="text-sm text-pink-300">Your Love Bingo Performance</p>
            </header>

            <main className="p-6 space-y-6">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
                    </div>
                ) : (
                    <>
                        {/* Personal Stats */}
                        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-6 border border-pink-200 shadow-lg">
                            <h3 className="text-pink-800 font-semibold text-lg mb-4 text-center">📊 Your Performance</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                                        <span className="text-white text-lg">🎮</span>
                                    </div>
                                    <div className="text-blue-700 text-sm font-medium">Games Played</div>
                                    <div className="text-blue-800 text-2xl font-bold">{userStats.totalGamesPlayed}</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                                        <span className="text-white text-lg">🏆</span>
                                    </div>
                                    <div className="text-yellow-700 text-sm font-medium">Games Won</div>
                                    <div className="text-yellow-800 text-2xl font-bold">{userStats.totalGamesWon}</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                                        <span className="text-white text-lg">📈</span>
                                    </div>
                                    <div className="text-green-700 text-sm font-medium">Win Rate</div>
                                    <div className="text-green-800 text-2xl font-bold">{userStats.winRate}%</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                                        <span className="text-white text-lg">💰</span>
                                    </div>
                                    <div className="text-purple-700 text-sm font-medium">Total Winnings</div>
                                    <div className="text-purple-800 text-2xl font-bold">ETB {userStats.totalWinnings}</div>
                                </div>
                            </div>
                        </div>

                        {/* Achievement Badges */}
                        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-6 border border-pink-200 shadow-lg">
                            <h3 className="text-pink-800 font-semibold text-lg mb-4 text-center">🏅 Achievements</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-3 rounded-lg border-2 ${userStats.totalGamesPlayed >= 1 ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100 border-gray-300'}`}>
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">{userStats.totalGamesPlayed >= 1 ? '🎮' : '🔒'}</div>
                                        <div className="text-sm font-medium">First Game</div>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg border-2 ${userStats.totalGamesWon >= 1 ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100 border-gray-300'}`}>
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">{userStats.totalGamesWon >= 1 ? '🏆' : '🔒'}</div>
                                        <div className="text-sm font-medium">First Win</div>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg border-2 ${userStats.totalGamesPlayed >= 10 ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100 border-gray-300'}`}>
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">{userStats.totalGamesPlayed >= 10 ? '🔥' : '🔒'}</div>
                                        <div className="text-sm font-medium">10 Games</div>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg border-2 ${userStats.winRate >= 50 ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100 border-gray-300'}`}>
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">{userStats.winRate >= 50 ? '⭐' : '🔒'}</div>
                                        <div className="text-sm font-medium">50% Win Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coming Soon for Leaderboard */}
                        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-6 border border-pink-200 shadow-lg">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                    <span className="text-white text-2xl">🏆</span>
                                </div>
                                <h3 className="text-pink-800 font-semibold text-lg mb-2">Global Leaderboard</h3>
                                <p className="text-pink-700">Coming Soon! Compete with players worldwide.</p>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <BottomNav current="scores" onNavigate={onNavigate} />
        </div>
    );
}

