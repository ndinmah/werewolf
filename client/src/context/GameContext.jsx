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

  useEffect(() => {
    if (!socket) return;

    socket.on('GAME_STATE_UPDATE', (update) => {
      setGameState(update);
    });

    socket.on('CHAT_MESSAGE', (message) => {
      setChatLogs((prev) => ({
        ...prev,
        [message.channel]: [...prev[message.channel], message]
      }));
    });

    socket.on('RECONNECT_SUCCESS', ({ gameState, chatLogs }) => {
      setGameState(gameState);
      setChatLogs(chatLogs || { general: [], wolves: [], ghost: [] });
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

    const handleConnect = () => {
      // Khi connect lại, nếu có myPlayer name và roomId trên URL thì thử reconnect
      // Tạm thời, một giải pháp là lưu vào sessionStorage khi join
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('GAME_STATE_UPDATE');
      socket.off('CHAT_MESSAGE');
      socket.off('RECONNECT_SUCCESS');
      socket.off('PLAYER_DISCONNECTED');
      socket.off('connect', handleConnect);
    };
  }, [socket]);

  // Derived state
  const myPlayer = gameState?.players?.find(p => p.id === socket?.id);
  const phase = gameState?.phase;
  const dayCount = gameState?.dayCount;
  const players = gameState?.players || [];

  return (
    <GameContext.Provider value={{ gameState, chatLogs, myPlayer, phase, dayCount, players }}>
      {children}
    </GameContext.Provider>
  );
};
