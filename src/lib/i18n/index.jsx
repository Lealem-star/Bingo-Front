import React, { createContext, useContext, useMemo, useState } from 'react';

const messages = {
    en: {
        game_title: 'Beteseb Bingo',
        welcome: 'Welcome to Beteseb Bingo',
        choose_stake: 'Choose Your Stake',
        play_10: 'Play 10',
        play_50: 'Play 50',
        leaderboard: 'Leaderboard',
        history: 'Game History',
        wallet: 'Wallet',
        verified: 'Verified',
        profile: 'Profile',
        sound: 'Sound',
    },
    am: {
        game_title: 'ቤተሰብ ቢንጎ',
        welcome: 'እንኳን በደህና መጡ ወደ ቤተሰብ ቢንጎ',
        choose_stake: 'ግመል ይምረጡ',
        play_10: 'ይጫወቱ 10',
        play_50: 'ይጫወቱ 50',
        leaderboard: 'የመሪዎች ሰሌዳ',
        history: 'የጨዋታ ታሪክ',
        wallet: 'ዋሌት',
        verified: 'የተረጋገጠ',
        profile: 'መገለጫ',
        sound: 'ድምጽ',
    },
};

const I18nContext = createContext({ t: (k) => k, locale: 'en', setLocale: () => { } });

export function I18nProvider({ children, defaultLocale = 'en' }) {
    const [locale, setLocale] = useState(defaultLocale);
    const t = useMemo(() => (key) => (messages[locale] && messages[locale][key]) || messages.en[key] || key, [locale]);
    const value = useMemo(() => ({ t, locale, setLocale }), [t, locale]);
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    return useContext(I18nContext);
}


