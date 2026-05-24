import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { RolesPage } from './pages/RolesPage';
import { GamePage } from './pages/GamePage';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <Router>
      <SocketProvider>
        <GameProvider>
          <div className="min-h-screen text-gray-100 font-sans selection:bg-wolf/30">
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
    </Router>
  );
}

export default App;
