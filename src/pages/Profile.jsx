import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth/AuthProvider';
import { apiFetch } from '../lib/api/client';

export default function Profile({ onNavigate }) {
    const [sound, setSound] = useState(true);
    const [profileData, setProfileData] = useState({
        user: {
            firstName: 'User',
            lastName: '',
            phone: null,
            isRegistered: false,
            totalGamesPlayed: 0,
            totalGamesWon: 0,
            registrationDate: new Date()
        },
        wallet: {
            main: 0,
            play: 50.0,
            coins: 1,
            gamesWon: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const { user, sessionId } = useAuth();

    const displayName = profileData.user?.firstName || user?.firstName || 'User';
    const initials = displayName.charAt(0).toUpperCase();

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!sessionId) return;
            try {
                setLoading(true);
                const data = await apiFetch('/user/profile', { sessionId });
                setProfileData(data);
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
                // Keep default values on error
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            {/* Header */}
            <header className="p-6 pt-16 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full border-2 border-yellow-400 bg-gradient-to-br from-pink-400 to-red-500 grid place-items-center text-2xl font-bold text-white shadow-lg">
                        {initials}
                    </div>
                    <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                    {profileData.user.phone && (
                        <div className="text-pink-200 text-sm">
                            📱 {profileData.user.phone}
                        </div>
                    )}
                </div>
            </header>

            {/* Main content */}
            <main className="p-6 space-y-8">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
                    </div>
                ) : (
                    <>
                        {/* User Stats */}
                        <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4 border border-pink-200 shadow-lg">
                            <h3 className="text-pink-800 font-semibold mb-3">📊 Game Statistics</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="text-pink-700 font-medium">Games Played</div>
                                    <div className="text-pink-800 text-xl font-bold">{profileData.user.totalGamesPlayed}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-purple-700 font-medium">Win Rate</div>
                                    <div className="text-purple-800 text-xl font-bold">
                                        {profileData.user.totalGamesPlayed > 0
                                            ? Math.round((profileData.user.totalGamesWon / profileData.user.totalGamesPlayed) * 100)
                                            : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Wallet & Statistics Cards */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Main Wallet */}
                            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-6 border border-pink-300 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                                        <span className="text-white text-lg">💰</span>
                                    </div>
                                    <div className="text-pink-700 text-sm font-medium mb-2">Main Wallet</div>
                                    <div className="text-pink-800 text-3xl font-bold">{profileData.wallet.main}</div>
                                </div>
                            </div>

                            {/* Play Wallet */}
                            <div className="bg-gradient-to-br from-lavender-100 to-lavender-200 rounded-xl p-6 border border-lavender-300 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                                        <span className="text-white text-lg">🎮</span>
                                    </div>
                                    <div className="text-purple-700 text-sm font-medium mb-2">Play Wallet</div>
                                    <div className="text-purple-800 text-3xl font-bold">{profileData.wallet.play}</div>
                                </div>
                            </div>

                            {/* Total Coins */}
                            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6 border border-yellow-300 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                                        <span className="text-white text-lg">🪙</span>
                                    </div>
                                    <div className="text-yellow-700 text-sm font-medium mb-2">Total Coins</div>
                                    <div className="text-yellow-800 text-3xl font-bold">{profileData.wallet.coins}</div>
                                </div>
                            </div>

                            {/* Games Won */}
                            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 border border-green-300 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                                        <span className="text-white text-lg">🏆</span>
                                    </div>
                                    <div className="text-green-700 text-sm font-medium mb-2">Games Won</div>
                                    <div className="text-green-800 text-3xl font-bold">{profileData.wallet.gamesWon}</div>
                                </div>
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="space-y-4">
                            <h2 className="text-white text-lg font-semibold">Settings</h2>

                            {/* Sound Toggle */}
                            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4 border border-pink-200 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-pink-800 font-medium">Sound</span>
                                    <button
                                        onClick={() => setSound(!sound)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${sound ? 'bg-gradient-to-r from-pink-400 to-red-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${sound ? 'translate-x-7' : 'translate-x-1'
                                            }`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <BottomNav current="profile" onNavigate={onNavigate} />
        </div>
    );
}

