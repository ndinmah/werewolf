import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';

/**
 * A custom hook to listen to socket events with proper registration, cleanup,
 * and resistance to unnecessary re-subscriptions on handler changes.
 */
export function useSocketEvent(
  socket: Socket | null,
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (...args: any[]) => void
) {
  const handlerRef = useRef(handler);

  // Update handler ref whenever it changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (...args: any[]) => {
      handlerRef.current(...args);
    };

    socket.on(eventName, listener);

    return () => {
      socket.off(eventName, listener);
    };
  }, [socket, eventName]);
}
