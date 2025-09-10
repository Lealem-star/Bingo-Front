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

