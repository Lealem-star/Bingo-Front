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
    const [error, setError] = useState(null);
    const { user, sessionId } = useAuth();

    const displayName = profileData.user?.firstName || user?.firstName || 'User';
    const initials = displayName.charAt(0).toUpperCase();

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!sessionId) {
                console.log('No sessionId available for profile fetch');
                return;
            }
            try {
                console.log('Fetching profile data with sessionId:', sessionId);
                setLoading(true);
                const data = await apiFetch('/user/profile', { sessionId });
                console.log('Profile data received:', data);
                setProfileData(data);
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [sessionId]);

    return (
        <div className="min-h-screen overflow-y-auto pb-28 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            {/* Header */}
            <header className="p-6 pt-16 text-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="profile-avatar">{initials}</div>
                    <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                </div>
            </header>

            {/* Main content */}
            <main className="p-6 space-y-6">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="text-red-400 text-lg mb-2">❌ Error Loading Data</div>
                        <div className="text-slate-300 mb-4">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Wallet & Statistics Cards - using explicit profile CSS for consistent layout */}
                        <div className="profile-cards">
                            {/* Main Wallet */}
                            <div className="profile-card">
                                <div className="title">
                                    <span>📘</span>
                                    <span>Main Wallet</span>
                                </div>
                                <div className="value">{profileData.wallet.main}</div>
                            </div>

                            {/* Play Wallet */}
                            <div className="profile-card">
                                <div className="title">
                                    <span>📗</span>
                                    <span>Play Wallet</span>
                                </div>
                                <div className="value">{profileData.wallet.play}</div>
                            </div>

                            {/* Total Coins */}
                            <div className="profile-card">
                                <div className="title">
                                    <span>🪙</span>
                                    <span>Total Coins</span>
                                </div>
                                <div className="value">{profileData.wallet.coins}</div>
                            </div>

                            {/* Games Won */}
                            <div className="profile-card">
                                <div className="title">
                                    <span>🏆</span>
                                    <span>Games Won</span>
                                </div>
                                <div className="value">{profileData.wallet.gamesWon}</div>
                            </div>
                        </div>

                        {/* Debug Info - Remove in production */}
                        <div className="space-y-3">
                            <h2 className="text-white text-base font-semibold">Debug Info</h2>
                            <div className="bg-slate-800/50 p-3 rounded-lg text-xs text-slate-300">
                                <div>Session ID: {sessionId ? 'Present' : 'Missing'}</div>
                                <div>User: {user ? JSON.stringify(user) : 'None'}</div>
                                <div>Profile Data: {JSON.stringify(profileData)}</div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs"
                                >
                                    Refresh Data
                                </button>
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="space-y-3">
                            <h2 className="text-white text-base font-semibold">Settings</h2>

                            {/* Sound Toggle - polished switch */}
                            <div className="profile-settings-row">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-200">
                                        <span>🔉</span>
                                        <span className="font-medium">Sound</span>
                                    </div>
                                    <button onClick={() => setSound(!sound)} className={`switch ${sound ? 'on' : ''}`} aria-pressed={sound}>
                                        <span className="knob"></span>
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

