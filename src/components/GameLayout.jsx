import React, { useState, useEffect, useRef } from 'react';
import { BingoCards } from '../data/cartellas.data';

export default function GameLayout({
    stake,
    called = [],
    selectedCartela,
    onClaimBingo,
    onNavigate,
    gameStatus = 'ready', // 'ready' or 'playing'
    currentCalledNumber = null,
    onLeave,
    onRefresh,
    playersCount = 0,
    gameId,
    walletBalance = 0,
    gamePhase = 'waiting', // 'waiting', 'playing', 'finished'
    isWatchingOnly = false
}) {
    const [showReadyMessage, setShowReadyMessage] = useState(true);
    const [recentCalledNumbers, setRecentCalledNumbers] = useState([]);
    const [winningPatternIndices, setWinningPatternIndices] = useState(null);
    const hasLocalBingo = Array.isArray(winningPatternIndices) && winningPatternIndices.length > 0;

    // Stable game ID per mount: LB + 6 digits, unless provided via props
    const generateGameId = () => `LB${Math.floor(100000 + Math.random() * 900000)}`;
    const gameIdRef = useRef(gameId || generateGameId());

    // Derash = 80% of (playersCount * stake)
    const numericStake = Number(stake || 0);
    const derashAmount = Math.floor(playersCount * numericStake * 0.8);

    // Check if user has sufficient wallet balance
    const numericWalletBalance = Number(walletBalance || 0);
    const hasInsufficientFunds = numericWalletBalance < numericStake;

    // Determine if user should be in watching-only mode
    const shouldWatchOnly = isWatchingOnly || hasInsufficientFunds || gamePhase === 'finished';

    // Show "Get ready for the next number!" for 3 seconds when game starts
    useEffect(() => {
        if (gameStatus === 'ready') {
            setShowReadyMessage(true);
            const timer = setTimeout(() => {
                setShowReadyMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setShowReadyMessage(false);
        }
    }, [gameStatus]);

    // Update recent called numbers (keep latest 4, newest on the right)
    useEffect(() => {
        if (currentCalledNumber) {
            setRecentCalledNumbers(prev => {
                const appended = [...prev, currentCalledNumber];
                // Remove duplicates while preserving order
                const unique = appended.filter((v, i, a) => a.indexOf(v) === i);
                return unique.slice(-4);
            });
        }
    }, [currentCalledNumber]);

    // Fallback: also refresh from full called list so chips are visible
    useEffect(() => {
        if (Array.isArray(called) && called.length) {
            const unique = called.filter((v, i, a) => a.indexOf(v) === i);
            setRecentCalledNumbers(unique.slice(-4));
        }
    }, [called]);

    const getLetterForNumber = (num) => {
        if (num >= 1 && num <= 15) return 'B';
        if (num >= 16 && num <= 30) return 'I';
        if (num >= 31 && num <= 45) return 'N';
        if (num >= 46 && num <= 60) return 'G';
        if (num >= 61 && num <= 75) return 'O';
        return '';
    };

    const chipBgForLetter = (letter) => {
        switch (letter) {
            case 'B': return 'bg-blue-500';
            case 'I': return 'bg-purple-500';
            case 'N': return 'bg-green-500';
            case 'G': return 'bg-pink-500';
            case 'O': return 'bg-orange-500';
            default: return 'bg-slate-600';
        }
    };

    // Find a winning pattern indices if present; otherwise null
    const findWinningPattern = () => {
        if (!selectedCartela || !BingoCards?.cards?.[selectedCartela - 1]) return null;

        const cartellaNumbers = BingoCards.cards[selectedCartela - 1];

        const patterns = [
            [0, 1, 2, 3, 4],
            [5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14],
            [15, 16, 17, 18, 19],
            [20, 21, 22, 23, 24],
            [0, 5, 10, 15, 20],
            [1, 6, 11, 16, 21],
            [2, 7, 12, 17, 22],
            [3, 8, 13, 18, 23],
            [4, 9, 14, 19, 24],
            [0, 6, 12, 18, 24],
            [4, 8, 12, 16, 20]
        ];

        for (const pattern of patterns) {
            const patternNumbers = pattern.map(index => {
                const row = Math.floor(index / 5);
                const col = index % 5;
                return cartellaNumbers[row]?.[col];
            }).filter(n => n !== 0);

            if (patternNumbers.every(num => called.includes(num))) {
                return pattern;
            }
        }

        return null;
    };

    // Check if player has any winning pattern
    const checkWinningPattern = () => {
        return !!findWinningPattern();
    };

    // Track and expose the current winning pattern for highlighting
    useEffect(() => {
        const pattern = findWinningPattern();
        setWinningPatternIndices(pattern);
    }, [called, selectedCartela]);

    const handleBingoClaim = () => {
        if (checkWinningPattern()) {
            onClaimBingo?.();
        } else {
            // Remove player from game for false claim
            onLeave?.();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            {/* Top Information Bar - 5 clickable buttons */}
            <div className="flex justify-between p-2 bg-purple-800/30">
                <button className="bg-purple-800/60 rounded-lg px-2 py-1 min-w-0 flex-1 mx-1 hover:bg-purple-700/60 transition-colors">
                    <div className="text-xs text-purple-200">Game ID</div>
                    <div className="text-white font-semibold text-sm">{gameIdRef.current}</div>
                </button>
                <button className="bg-purple-800/60 rounded-lg px-2 py-1 min-w-0 flex-1 mx-1 hover:bg-purple-700/60 transition-colors">
                    <div className="text-xs text-purple-200">Players</div>
                    <div className="text-white font-semibold text-sm">{playersCount}</div>
                </button>
                <button className="bg-purple-800/60 rounded-lg px-2 py-1 min-w-0 flex-1 mx-1 hover:bg-purple-700/60 transition-colors">
                    <div className="text-xs text-purple-200">Bet</div>
                    <div className="text-white font-semibold text-sm">{stake}</div>
                </button>
                <button className="bg-purple-800/60 rounded-lg px-2 py-1 min-w-0 flex-1 mx-1 hover:bg-purple-700/60 transition-colors">
                    <div className="text-xs text-purple-200">Derash</div>
                    <div className="text-white font-semibold text-sm">{derashAmount}</div>
                </button>
                <button className="bg-purple-800/60 rounded-lg px-2 py-1 min-w-0 flex-1 mx-1 hover:bg-purple-700/60 transition-colors">
                    <div className="text-xs text-purple-200">Called</div>
                    <div className="text-white font-semibold text-sm">{called.length}</div>
                </button>
            </div>

            {/* Main Content Area - 2 Column Layout (Left grid, Right stacked) */}
            <div className="grid grid-cols-2 p-2 gap-2">
                {/* Left Card - Complete BINGO Grid */}
                <div className="bg-purple-800 border-2 border-red-500 rounded-xl p-2">
                    <div className="grid grid-cols-5 gap-0">
                        {/* B Column */}
                        <div className="space-y-0.5">
                            <div className="text-center text-white font-bold text-[11px] bg-blue-500 rounded-md py-1">B</div>
                            {Array.from({ length: 15 }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    className={`w-full text-[10px] leading-none py-0.5 rounded-md border transition-colors duration-200 flex items-center justify-center ${called.includes(n) ? 'bg-orange-500/90 border-orange-400 text-white' : 'bg-white/10 border-white/20 text-white'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        {/* I Column */}
                        <div className="space-y-0.5">
                            <div className="text-center text-white font-bold text-[11px] bg-purple-500 rounded-md py-1">I</div>
                            {Array.from({ length: 15 }, (_, i) => i + 16).map(n => (
                                <button
                                    key={n}
                                    className={`w-full text-[10px] leading-none py-0.5 rounded-md border transition-colors duration-200 flex items-center justify-center ${called.includes(n) ? 'bg-orange-500/90 border-orange-400 text-white' : 'bg-white/10 border-white/20 text-white'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        {/* N Column */}
                        <div className="space-y-0.5">
                            <div className="text-center text-white font-bold text-[11px] bg-green-500 rounded-md py-1">N</div>
                            {Array.from({ length: 15 }, (_, i) => i + 31).map(n => (
                                <button
                                    key={n}
                                    className={`w-full text-[10px] leading-none py-0.5 rounded-md border transition-colors duration-200 flex items-center justify-center ${called.includes(n) ? 'bg-orange-500/90 border-orange-400 text-white' : 'bg-white/10 border-white/20 text-white'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        {/* G Column */}
                        <div className="space-y-0.5">
                            <div className="text-center text-white font-bold text-[11px] bg-pink-500 rounded-md py-1">G</div>
                            {Array.from({ length: 15 }, (_, i) => i + 46).map(n => (
                                <button
                                    key={n}
                                    className={`w-full text-[10px] leading-none py-0.5 rounded-md border transition-colors duration-200 flex items-center justify-center ${called.includes(n) ? 'bg-orange-500/90 border-orange-400 text-white' : 'bg-white/10 border-white/20 text-white'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        {/* O Column */}
                        <div className="space-y-0.5">
                            <div className="text-center text-white font-bold text-[11px] bg-orange-500 rounded-md py-1">O</div>
                            {Array.from({ length: 15 }, (_, i) => i + 61).map(n => (
                                <button
                                    key={n}
                                    className={`w-full text-[10px] leading-none py-0.5 rounded-md border transition-colors duration-200 flex items-center justify-center ${called.includes(n) ? 'bg-orange-500/90 border-orange-400 text-white' : 'bg-white/10 border-white/20 text-white'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Two Cards Stacked */}
                <div className="space-y-2">
                    {/* Right Top Card - Game Status */}
                    <div className="bg-purple-800/30 rounded-xl p-2">
                        {/* Game Status Header */}
                        <div className="flex items-center justify-between mb-2">
                            {showReadyMessage ? (
                                <div className="flex items-center gap-2 w-full mr-2">
                                    <div className="flex gap-2">
                                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full"></div>
                                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full"></div>
                                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 h-3 bg-white/10 rounded-full border border-white/15 overflow-hidden">
                                        <div className="h-full w-2/3 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1 border border-white/15">
                                    {recentCalledNumbers.map((num, idx) => {
                                        const letter = getLetterForNumber(num);
                                        return (
                                            <div key={`${num}-${idx}`} className={`text-white text-[11px] font-bold px-2 py-1 rounded-full ${chipBgForLetter(letter)} shadow-sm`}>{`${letter}-${num}`}</div>
                                        );
                                    })}
                                </div>
                            )}
                            <button className="text-white text-sm">🔊</button>
                        </div>

                        {/* Game Message or Called Numbers */}
                        {showReadyMessage ? (
                            <div className="text-white font-semibold mb-3 text-center text-sm">Get ready for the next number!</div>
                        ) : null}

                        <div className="text-center mb-3">
                            <div className="mx-auto w-full rounded-md border border-white/10 bg-gradient-to-b from-black/25 to-black/10 p-3 min-h-[120px] flex items-center justify-center">
                                {currentCalledNumber ? (
                                    <div className="w-24 h-24 rounded-full bg-white ring-4 ring-yellow-400 flex items-center justify-center shadow">
                                        <div className="text-purple-700 font-extrabold">{`${getLetterForNumber(currentCalledNumber)}-${currentCalledNumber}`}</div>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-white/70 ring-2 ring-white/40 flex items-center justify-center text-purple-700/60 font-bold">0-75</div>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {showReadyMessage && (
                            <div className="w-full bg-white/10 rounded-full h-1 mb-1">
                                <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-1 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        )}
                    </div>














                    {/* Right Bottom Card - User's Cartella or Watching Only */}
                    <div className="bg-purple-800/30 rounded-xl p-2">
                        {shouldWatchOnly ? (
                            /* Watching Only Mode */
                            <div className="bg-blue-900 border-2 border-red-500 rounded-lg p-4 text-center">
                                <div className="text-white font-bold text-lg mb-3">Watching Only</div>
                                <div className="text-white/80 text-sm mb-4">
                                    {hasInsufficientFunds ? (
                                        <>
                                            <div className="mb-2">You don't have enough balance to play.</div>
                                            <div>Please deposit to your wallet first.</div>
                                        </>
                                    ) : gamePhase === 'finished' ? (
                                        <>
                                            <div className="mb-2">This game has finished.</div>
                                            <div>Please wait for the next round to begin.</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="mb-2">This round of the game has started.</div>
                                            <div>Please wait here until a new round begins.</div>
                                        </>
                                    )}
                                </div>
                                {/* Wallet button removed as requested */}
                            </div>
                        ) : (
                            /* Normal Cartella Mode */
                            <>
                                {/* User's Cartella - 5x5 Grid */}
                                <div className="bg-blue-900 border-2 border-red-500 rounded-lg p-2">
                                    {/* BINGO Header */}
                                    <div className="grid grid-cols-5 gap-0 mb-1">
                                        <div className="text-center text-white font-bold text-[11px] bg-blue-500 rounded-md py-1">B</div>
                                        <div className="text-center text-white font-bold text-[11px] bg-purple-500 rounded-md py-1">I</div>
                                        <div className="text-center text-white font-bold text-[11px] bg-green-500 rounded-md py-1">N</div>
                                        <div className="text-center text-white font-bold text-[11px] bg-pink-500 rounded-md py-1">G</div>
                                        <div className="text-center text-white font-bold text-[11px] bg-orange-500 rounded-md py-1">O</div>
                                    </div>

                                    {/* Numbers Grid */}
                                    <div className="grid grid-cols-5 gap-0.5">
                                        {Array.from({ length: 25 }, (_, i) => {
                                            const row = Math.floor(i / 5);
                                            const col = i % 5;
                                            const isCenter = row === 2 && col === 2;
                                            const isWinningCell = Array.isArray(winningPatternIndices) && winningPatternIndices.includes(i);

                                            if (isCenter) {
                                                return (
                                                    <div key={i} className={`bg-green-500 rounded-md text-center py-1 flex items-center justify-center ${isWinningCell ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}>
                                                        <span className="text-yellow-300 text-sm">★</span>
                                                    </div>
                                                );
                                            }

                                            // Use selected cartella data if available
                                            let displayNumbers = [
                                                [3, 17, 43, 54, 63],
                                                [15, 20, 32, 58, 61],
                                                [5, 18, 0, 50, 72],
                                                [7, 25, 34, 46, 67],
                                                [2, 23, 45, 59, 64]
                                            ];

                                            if (selectedCartela && BingoCards?.cards?.[selectedCartela - 1]) {
                                                displayNumbers = BingoCards.cards[selectedCartela - 1];
                                            }

                                            const number = displayNumbers[row]?.[col] || 0;
                                            const isCalled = called.includes(number);

                                            return (
                                                <button
                                                    key={i}
                                                    className={`w-full text-[10px] leading-none py-0.5 rounded-md border transition-colors duration-200 flex items-center justify-center ${isCalled ? 'bg-orange-500/90 border-orange-400 text-white' : 'bg-white/10 text-white border-white/20'} ${isWinningCell ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                                                >
                                                    {number}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Cartela Number Display */}
                                <div className="text-center mt-2">
                                    <div className="bg-amber-800 text-white text-sm font-bold px-4 py-1 rounded-full inline-block">
                                        Cartela No : {selectedCartela || 47}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>















            {/* Bottom Action Buttons */}
            <div className="flex justify-between p-2 mt-3 gap-2">
                <button
                    onClick={onLeave}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg font-semibold flex-1 text-sm hover:bg-red-600 transition-colors"
                >
                    Leave
                </button>
                <button
                    onClick={onRefresh}
                    className="bg-orange-500 text-white px-3 py-2 rounded-lg font-semibold flex-1 flex items-center justify-center gap-1 text-sm hover:bg-orange-600 transition-colors"
                >
                    <span>↻</span> Refresh
                </button>
                <button
                    onClick={shouldWatchOnly ? undefined : handleBingoClaim}
                    disabled={shouldWatchOnly}
                    className={`px-3 py-2 rounded-lg font-bold flex-1 text-sm transition-all ${shouldWatchOnly
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : `bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 ${hasLocalBingo ? 'ring-4 ring-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.7)] animate-pulse' : ''}`
                        }`}
                >
                    BINGO
                </button>
            </div>
        </div>
    );
}