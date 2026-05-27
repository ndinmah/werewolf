import { createActor, assign, Actor } from 'xstate';
import type { Server } from 'socket.io';
import { gameMachine } from './gameMachine.ts';
import type { ChatLogs, SeerVision } from '../types/game.ts';
import { startFirstNight, startNight } from '../socket/nightManager.ts';
import { getRoom, updateRoomStatus, getRooms } from '../socket/roomManager.ts';
import { finalizeVoting } from '../socket/voteManager.ts';
import { findPendingHunter } from './gameHelpers.ts';
import { notifyPlayers } from '../socket/notificationService.ts';

export interface GameData {
  machine: typeof gameMachine;
  actor: Actor<typeof gameMachine>;
  chatLogs: ChatLogs;
  votes: Record<string, string>;
  disconnectTimers: Record<string, NodeJS.Timeout>;
  phaseTimer: NodeJS.Timeout | null;
  lastProtectedId: string | null;
  seerVisions: Record<string, SeerVision[]>;
  pendingNightRoles?: string[];
  currentNightRoleIndex?: number;
  nightActions?: Record<string, { actorId: string; targetId: string }>;
  /** Phù thủy đã dùng quyền hồi sinh trong game này chưa */
  witchHealUsed: boolean;
  /** Phù thủy đã dùng quyền đầu độc trong game này chưa */
  witchPoisonUsed: boolean;
  /** Rate limiting: lưu player nào đã submit night action trong đêm này */
  nightActionSubmitted: Set<string>;
  /** Rate limiting: lưu player nào đã vote trong pha vote này */
  voteSubmitted: Set<string>;
  /** Ma Sói vote */
  wolfVotes?: Record<string, string>;
  /** Ma Sói vote timestamps */
  wolfVoteTimes?: Record<string, number>;
}

// Map lưu trữ: roomId -> { machine, actor, chatLogs, votes, disconnectTimers, phaseTimer, lastProtectedId, seerVisions }
const gameRooms = new Map<string, GameData>();

export const createGameActor = (roomId: string, io: Server) => {
  if (gameRooms.has(roomId)) {
    return gameRooms.get(roomId)!.actor;
  }

  // Cấu hình các action có tương tác socket/timer thực tế
  const machineWithActions = gameMachine.provide({
    actions: {
      notifyPlayers: ({ context }) => {
        notifyPlayers(roomId, context, io);
      },
      runFirstNightStart: () => {
        startFirstNight(roomId, io);
      },
      startRoleRevealTimer: assign(() => {
        return startTimerAction(roomId, 10 * 1000);
      }),
      runNightStart: () => {
        startNight(roomId, io);
      },
      startDayStartTimer: assign(({ context }) => {
        const duration = (context.settings?.dayStartDuration || 8) * 1000;
        return startTimerAction(roomId, duration);
      }),
      startDayDiscussTimer: assign(({ context }) => {
        const duration = (context.settings?.discussionTime || 120) * 1000;
        return startTimerAction(roomId, duration);
      }),
      startVotingTimer: assign(({ context }) => {
        const duration = (context.settings?.voteTime || 60) * 1000;
        // Reset vote rate limiting khi bắt đầu phase vote mới
        const gameData = gameRooms.get(roomId);
        if (gameData) gameData.voteSubmitted = new Set();
        return startTimerAction(roomId, duration);
      }),
      runHunterRetaliationStart: assign(({ context }) => {
        const hunter = findPendingHunter(context);
        const duration = 30 * 1000;
        const timerInfo = startTimerAction(roomId, duration);

        if (hunter && io) {
          const socket = io.sockets.sockets.get(hunter.id);
          if (socket) {
            socket.emit('HUNTER_RETALIATION_PROMPT', {
              targetablePlayers: context.players.filter(p => p.isAlive && p.id !== hunter.id).map(p => ({
                id: p.id,
                name: p.name
              }))
            });
          }
        }

        return timerInfo;
      }),
      startGameOverTimer: assign(() => {
        const duration = 10 * 1000;
        return startTimerAction(roomId, duration, () => {
          const room = getRoom(roomId);
          if (room) {
            updateRoomStatus(roomId, 'Lobby');
            destroyGameActor(roomId);

            io.to(roomId).emit('ROOM_UPDATED', room);
            io.to(roomId).emit('GAME_RESET');
            io.emit('ROOM_LIST', getRooms());
          }
        });
      }),
      autoResolveVotes: () => {
        finalizeVoting(roomId, io);
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
    disconnectTimers: {},
    phaseTimer: null,
    lastProtectedId: null,
    seerVisions: {},
    witchHealUsed: false,
    witchPoisonUsed: false,
    nightActionSubmitted: new Set(),
    voteSubmitted: new Set(),
    wolfVotes: {},
    wolfVoteTimes: {},
  });

  return actor;
};

export const getGameActor = (roomId: string) => {
  const room = gameRooms.get(roomId);
  return room ? room.actor : null;
};

export const getGameData = (roomId: string): GameData | undefined => {
  return gameRooms.get(roomId);
};

export const setGameTimer = (roomId: string, duration: number, callback: () => void): void => {
  const room = gameRooms.get(roomId);
  if (room) {
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
    }
    room.phaseTimer = setTimeout(callback, duration);
  }
};

export const clearGameTimer = (roomId: string): void => {
  const room = gameRooms.get(roomId);
  if (room && room.phaseTimer) {
    clearTimeout(room.phaseTimer);
    room.phaseTimer = null;
  }
};

export const destroyGameActor = (roomId: string): void => {
  const room = gameRooms.get(roomId);
  if (room) {
    room.actor.stop();
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
    }
    for (const timer of Object.values(room.disconnectTimers)) {
      clearTimeout(timer);
    }
    gameRooms.delete(roomId);
  }
};

/**
 * Tạo timer của game và trả về thông tin thời gian lưu vào context
 * (Giải quyết trùng lặp D5)
 */
export const startTimerAction = (
  roomId: string,
  durationMs: number,
  onExpired?: () => void
): { timerDuration: number; timerStartAt: number } => {
  const expiredCallback = onExpired || (() => {
    const actor = getGameActor(roomId);
    if (actor) actor.send({ type: 'TIMER_EXPIRED' });
  });

  setGameTimer(roomId, durationMs, expiredCallback);

  return {
    timerDuration: durationMs,
    timerStartAt: Date.now()
  };
};
