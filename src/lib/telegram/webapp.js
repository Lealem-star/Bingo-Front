/* Minimal Telegram WebApp bootstrap helper. */
export function initTelegramWebApp() {
    const tg = window?.Telegram?.WebApp;
    if (!tg) return null;
    try {
        tg.ready();
        tg.expand();
        return tg;
    } catch (_) {
        return tg || null;
    }
}


