import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const GameContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  return useContext(GameContext);
};

export const GameProvider = ({ children }) => {
  const socket = useSocket();
  const [gameState, setGameState] = useState(null);
  const [chatLogs, setChatLogs] = useState({ general: [], wolves: [], ghost: [] });
  
  // Real-time gameplay states
  const [seerVisions, setSeerVisions] = useState([]);
  const [nightActionPrompt, setNightActionPrompt] = useState(null);
  const [votingResult, setVotingResult] = useState(null);
  const [nightStatus, setNightStatus] = useState(null);
  
  // Hunter states
  const [hunterPrompt, setHunterPrompt] = useState(null);
  const [hunterShotResult, setHunterShotResult] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('GAME_STATE_UPDATE', (update) => {
      setGameState(update);
      
      // Tự động dọn dẹp prompt ban đêm và status khi không còn là NightPhase
      if (update.phase !== 'night') {
        setNightActionPrompt(null);
        setNightStatus(null);
      }
      // Dọn dẹp votingResult khi không còn ở phase voting
      if (update.phase !== 'voting') {
        setVotingResult(null);
      }
      // Dọn dẹp hunterPrompt khi không ở phase hunterRetaliation
      if (update.phase !== 'hunterRetaliation') {
        setHunterPrompt(null);
      } else {
        // Reset shot result khi bắt đầu phase retaliation mới
        setHunterShotResult(null);
      }
    });

    socket.on('CHAT_MESSAGE', (message) => {
      setChatLogs((prev) => ({
        ...prev,
        [message.channel]: [...prev[message.channel], message]
      }));
    });

    socket.on('RECONNECT_SUCCESS', ({ gameState, chatLogs, seerVisions }) => {
      setGameState(gameState);
      setChatLogs(chatLogs || { general: [], wolves: [], ghost: [] });
      setSeerVisions(seerVisions || []);
    });

    socket.on('PLAYER_DISCONNECTED', ({ playerId }) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => 
            p.id === playerId ? { ...p, disconnected: true } : p
          )
        };
      });
    });

    // Các socket listeners đặc thù cho Phase 3
    socket.on('NIGHT_ACTION_PROMPT', (prompt) => {
      setNightActionPrompt(prompt);
    });

    socket.on('NIGHT_STATUS_UPDATE', (status) => {
      setNightStatus(status);
    });

    socket.on('SEER_RESULT', (vision) => {
      setSeerVisions((prev) => [...prev, vision]);
    });

    socket.on('VOTING_RESULT', (result) => {
      setVotingResult(result);
    });

    socket.on('HUNTER_RETALIATION_PROMPT', (prompt) => {
      setHunterPrompt(prompt);
    });

    socket.on('HUNTER_SHOT_RESULT', (result) => {
      setHunterShotResult(result);
    });

    socket.on('GAME_RESET', () => {
      setGameState(null);
      setChatLogs({ general: [], wolves: [], ghost: [] });
      setSeerVisions([]);
      setNightActionPrompt(null);
      setVotingResult(null);
      setNightStatus(null);
      setHunterPrompt(null);
      setHunterShotResult(null);
    });

    const handleConnect = () => {
      // Logic reconnect tự động nếu cần thiết
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('GAME_STATE_UPDATE');
      socket.off('CHAT_MESSAGE');
      socket.off('RECONNECT_SUCCESS');
      socket.off('PLAYER_DISCONNECTED');
      socket.off('NIGHT_ACTION_PROMPT');
      socket.off('NIGHT_STATUS_UPDATE');
      socket.off('SEER_RESULT');
      socket.off('VOTING_RESULT');
      socket.off('HUNTER_RETALIATION_PROMPT');
      socket.off('HUNTER_SHOT_RESULT');
      socket.off('GAME_RESET');
      socket.off('connect', handleConnect);
    };
  }, [socket]);

  // Derived state
  const myPlayer = gameState?.players?.find(p => p.id === socket?.id);
  const phase = gameState?.phase;
  const dayCount = gameState?.dayCount;
  const players = gameState?.players || [];

  return (
    <GameContext.Provider value={{ 
      gameState, 
      chatLogs, 
      myPlayer, 
      phase, 
      dayCount, 
      players,
      seerVisions,
      nightActionPrompt,
      setNightActionPrompt,
      votingResult,
      setVotingResult,
      nightStatus,
      hunterPrompt,
      setHunterPrompt,
      hunterShotResult
    }}>
      {children}
    </GameContext.Provider>
  );
};
