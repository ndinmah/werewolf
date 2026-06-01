import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const isProduction = import.meta.env.PROD;
// Trong môi trường development (npm run dev), dùng localhost:3001.
// Khi build xong (chạy qua tunnel), dùng undefined để tự động trỏ vào cùng domain của giao diện.
const serverUrl = isProduction ? undefined : (import.meta.env.VITE_SERVER_URL || 'http://localhost:3001');

const socket: Socket = io(serverUrl as any);

const SocketContext = createContext<Socket | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = (): Socket => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleAutoReconnect = () => {
      try {
        const sessionStr = sessionStorage.getItem('werewolf_session');
        if (!sessionStr) return;
        const { roomId, playerName } = JSON.parse(sessionStr) as { roomId: string; playerName: string };
        if (!roomId || !playerName) return;

        console.log('Attempting automatic room reconnect for:', { roomId, playerName });
        // Đầu tiên, thử RECONNECT_ROOM (nếu game đang chạy)
        socket.emit('RECONNECT_ROOM', { roomId, playerName }, (response: { success: boolean }) => {
          if (response && response.success) {
            console.log('RECONNECT_ROOM successful');
          } else {
            console.log('RECONNECT_ROOM failed, attempting JOIN_ROOM (lobby)...');
            // Nếu không thành công, có thể game chưa chạy (đang ở lobby), thử JOIN_ROOM
            socket.emit('JOIN_ROOM', { roomId, playerName }, (joinResponse: { success: boolean; error?: string }) => {
              if (joinResponse && joinResponse.success) {
                console.log('JOIN_ROOM successful on reconnect');
              } else {
                console.log('JOIN_ROOM failed on reconnect. Clearing session.', joinResponse?.error);
                sessionStorage.removeItem('werewolf_session');
              }
            });
          }
        });
      } catch (err) {
        console.error('Failed to parse or execute auto-reconnect session:', err);
      }
    };

    const onConnect = () => {
      setIsConnected(true);
      handleAutoReconnect();
    };
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Nếu đã kết nối sẵn khi mount, kiểm tra reconnect
    if (socket.connected) {
      handleAutoReconnect();
    }

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
