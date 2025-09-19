import React, { useState, useEffect } from 'react';
import Game from './pages/Game';
import CartelaSelection from './pages/CartelaSelection';
import Rules from './pages/Rules';
import Scores from './pages/Scores';
import History from './pages/History';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import { AuthProvider } from './lib/auth/AuthProvider.jsx';
import AdminLayout from './admin/AdminLayout.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('game');
  const [selectedStake, setSelectedStake] = useState(null);
  const [selectedCartela, setSelectedCartela] = useState(null);
  const [isAdminApp, setIsAdminApp] = useState(false);

  // Handle hash-based routing for admin panel
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash === 'admin') {
        setCurrentPage('admin');
      } else if (hash === '') {
        setCurrentPage('game');
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);


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
      case 'admin':
        return <AdminLayout onNavigate={setCurrentPage} />;
      case 'rules':
        return <Rules onNavigate={setCurrentPage} />;
      case 'scores':
        return <Scores onNavigate={setCurrentPage} />;
      // history removed
      case 'wallet':
        return <Wallet onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile onNavigate={setCurrentPage} />;
      default:
        return <Game onNavigate={setCurrentPage} onStakeSelected={handleStakeSelected} selectedCartela={selectedCartela} selectedStake={selectedStake} />;
    }
  };

  return (
    <AuthProvider>
      <div className="App">
        {renderPage()}
      </div>
    </AuthProvider>
  );
}

export default App;
