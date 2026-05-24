import { createActor } from 'xstate';
import { gameMachine } from './gameMachine.js';

// Map lưu trữ: roomId -> { machine, actor, chatLogs, votes, disconnectTimers }
const gameRooms = new Map();

export const createGameActor = (roomId, io) => {
  if (gameRooms.has(roomId)) {
    return gameRooms.get(roomId).actor;
  }

  // Tùy chỉnh action notifyPlayers cho từng phòng để phát socket
  const machineWithActions = gameMachine.provide({
    actions: {
      notifyPlayers: ({ context }) => {
        if (io) {
          io.to(roomId).emit('GAME_STATE_UPDATE', {
            phase: context.phase,
            dayCount: context.dayCount,
            players: context.players, // Có thể lọc bớt các role trước khi gửi nếu cần
          });
        }
      }
    }
  });

  const actor = createActor(machineWithActions);
  actor.start();

  gameRooms.set(roomId, {
    machine: machineWithActions,
    actor: actor,
    chatLogs: {
      general: [],
      wolves: [],
      ghost: []
    },
    votes: {},
    disconnectTimers: {}
  });

  return actor;
};

export const getGameActor = (roomId) => {
  const room = gameRooms.get(roomId);
  return room ? room.actor : null;
};

export const getGameData = (roomId) => {
  return gameRooms.get(roomId);
};

export const destroyGameActor = (roomId) => {
  const room = gameRooms.get(roomId);
  if (room) {
    room.actor.stop();
    // Xóa các timeout nếu có
    for (const timer of Object.values(room.disconnectTimers)) {
      clearTimeout(timer);
    }
    gameRooms.delete(roomId);
  }
};
