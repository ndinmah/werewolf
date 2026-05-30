import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { RolesPage } from './pages/RolesPage';
import { GamePage } from './pages/GamePage';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/UI/ErrorBoundary';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <ToastProvider>
          <SocketProvider>
            <GameProvider>
              <div className="min-h-screen bg-[#030303] text-gray-300 font-['Cormorant_Garamond',serif] selection:bg-[#8a0303]/50 selection:text-white">
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/room/:id" element={<LobbyPage />} />
                  <Route path="/room/:id/game" element={<GamePage />} />
                  <Route path="/roles" element={<RolesPage />} />
                </Routes>
              </div>
            </GameProvider>
          </SocketProvider>
        </ToastProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
