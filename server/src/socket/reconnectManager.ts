import type { Server, Socket } from 'socket.io';
import { getRoom } from './roomManager.ts';
import { getGameData } from '../engine/gameStateManager.ts';
import { findPendingHunter } from '../engine/gameHelpers.ts';
import { SOCKET_EVENTS } from '../constants/events.ts';

export type SocketCallback = (res: { success: boolean; error?: string; [key: string]: unknown }) => void;

/**
 * Xử lý quá trình reconnect (kết nối lại) của người chơi vào phòng game
 * (Giải quyết vấn đề S2)
 */
export const handlePlayerReconnect = (
  io: Server,
  socket: Socket,
  roomId: string,
  playerName: string,
  callback?: SocketCallback,
): boolean => {
  const room = getRoom(roomId);
  const gameData = getGameData(roomId);
  const playerId = socket.id;

  if (room && gameData) {
    const existingPlayer = room.players.find((p) => p.name === playerName);
    if (existingPlayer) {
      if (gameData.disconnectTimers[existingPlayer.id]) {
        clearTimeout(gameData.disconnectTimers[existingPlayer.id]);
        delete gameData.disconnectTimers[existingPlayer.id];
      }

      const oldId = existingPlayer.id;
      existingPlayer.id = playerId;

      if (room.hostId === oldId) {
        room.hostId = playerId;
      }

      const mPlayer = gameData.actor.getSnapshot().context.players.find((p) => p.name === playerName);
      if (mPlayer) {
        // Dispatch event để XState machine tự cập nhật context (không mutation trực tiếp)
        gameData.actor.send({ type: 'PLAYER_RECONNECTED', oldId: mPlayer.id, newId: playerId });
      }

      socket.join(roomId);

      io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);

      const myVisions = gameData.seerVisions?.[playerId] || [];
      socket.emit(SOCKET_EVENTS.RECONNECT_SUCCESS, {
        room,
        gameState: gameData.actor.getSnapshot().context,
        chatLogs: gameData.chatLogs,
        seerVisions: myVisions,
      });

      // Gửi prompt ban đêm nếu đang đến lượt
      const snapshot = gameData.actor.getSnapshot();
      const context = snapshot.context;
      if (snapshot.value === 'NightPhase' && gameData.pendingNightRoles) {
        const currentRole = gameData.pendingNightRoles[gameData.currentNightRoleIndex || 0];
        if (mPlayer && currentRole === mPlayer.role) {
          const alivePlayers = snapshot.context.players.filter((p) => p.isAlive);
          socket.emit(SOCKET_EVENTS.NIGHT_ACTION_PROMPT, {
            role: currentRole,
            targetablePlayers: alivePlayers.map((p) => ({
              id: p.id,
              name: p.name,
              isAlive: p.isAlive,
            })),
            excludeTargetId: currentRole === 'BODYGUARD' ? gameData.lastProtectedId : null,
          });
        }
      }

      // Gửi prompt Hunter trả thù nếu là Hunter đã chết
      if (snapshot.value === 'HunterRetaliation') {
        const hunter = findPendingHunter(context);

        if (hunter && hunter.id === playerId) {
          socket.emit(SOCKET_EVENTS.HUNTER_RETALIATION_PROMPT, {
            targetablePlayers: context.players
              .filter((p) => p.isAlive && p.id !== hunter.id)
              .map((p) => ({
                id: p.id,
                name: p.name,
              })),
          });
        }
      }

      if (callback) callback({ success: true, room });
      return true;
    }
  }
  return false;
};
