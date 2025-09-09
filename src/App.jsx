import React, { useState } from 'react';
import Game from './pages/Game';
import CartelaSelection from './pages/CartelaSelection';
import Rules from './pages/Rules';
import Scores from './pages/Scores';
import History from './pages/History';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import { I18nProvider } from './lib/i18n';
import { initTelegramWebApp } from './lib/telegram/webapp';
import { AuthProvider } from './lib/auth/AuthProvider.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('game');
  const [selectedStake, setSelectedStake] = useState(null);
  const [selectedCartela, setSelectedCartela] = useState(null);

  // init Telegram (no-op on web)
  if (typeof window !== 'undefined') {
    initTelegramWebApp();
  }

  const handleStakeSelected = (stake) => {
    setSelectedStake(stake);
    setCurrentPage('cartela-selection');
  };

  const handleCartelaSelected = (cartela) => {
    setSelectedCartela(cartela);
    if (cartela === null) {
      // If cartela is null, also clear the stake to go back to stake selection
      setSelectedStake(null);
    }
    setCurrentPage('game');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'game':
        return <Game onNavigate={setCurrentPage} onStakeSelected={handleStakeSelected} selectedCartela={selectedCartela} selectedStake={selectedStake} />;
      case 'cartela-selection':
        return <CartelaSelection onNavigate={setCurrentPage} stake={selectedStake} onCartelaSelected={handleCartelaSelected} />;
      case 'rules':
        return <Rules onNavigate={setCurrentPage} />;
      case 'scores':
        return <Scores onNavigate={setCurrentPage} />;
      case 'history':
        return <History onNavigate={setCurrentPage} />;
      case 'wallet':
        return <Wallet onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile onNavigate={setCurrentPage} />;
      default:
        return <Game onNavigate={setCurrentPage} onStakeSelected={handleStakeSelected} selectedCartela={selectedCartela} selectedStake={selectedStake} />;
    }
  };

  return (
    <I18nProvider defaultLocale={(window?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) || 'en'}>
      <AuthProvider>
        <div className="App">
          {renderPage()}
        </div>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
