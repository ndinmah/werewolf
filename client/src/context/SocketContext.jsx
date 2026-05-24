import { createContext, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      // Keep socket open during React Strict Mode quick mounts/unmounts.
      // It will close when the tab is closed/unloaded automatically.
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
