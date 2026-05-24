import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {!isConnected && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-1 z-50 animate-pulse text-sm font-medium">
          ⚠️ Mất kết nối. Đang thử kết nối lại...
        </div>
      )}
      {children}
    </SocketContext.Provider>
  );
};
