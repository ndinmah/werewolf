import type { Server } from 'socket.io';
import { getGameData } from '../engine/gameStateManager.ts';
import { ROLES } from '../roles/index.ts';
import type { Player } from '../types/game.ts';
import { RoleRegistry } from '../roles/RoleHandler.ts';

// Chắc chắn các handler đã được đăng ký bằng cách import chúng
import '../roles/handlers/CupidHandler.ts';
import '../roles/handlers/WerewolfHandler.ts';
import '../roles/handlers/WitchHandler.ts';
import '../roles/handlers/SeerHandler.ts';
import '../roles/handlers/BodyguardHandler.ts';
import '../roles/handlers/HunterHandler.ts';

export const startFirstNight = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  gameData.nightActions = {};
  gameData.nightActionSubmitted = new Set();
  gameData.votes = {};

  // Tìm các role cần hành động trong First Night (hiện tại có CUPID, hoặc fallback sang WEREWOLF)
  const cupid = alivePlayers.find(p => p.role === 'CUPID');

  if (cupid) {
    const handler = RoleRegistry.getHandler('CUPID');
    if (handler && handler.onFirstNightStart) {
      handler.onFirstNightStart(roomId, context, gameData, io);
    }
  } else {
    // Không có CUPID, tiến hành cho Sói nhận diện
    const handler = RoleRegistry.getHandler('WEREWOLF');
    if (handler && handler.onFirstNightStart) {
      handler.onFirstNightStart(roomId, context, gameData, io);
    }
  }
};

export const startNight = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  const activeRoles = [...new Set(alivePlayers.map(p => p.role))]
    .filter((roleId): roleId is keyof typeof ROLES => typeof roleId === 'string' && !!ROLES[roleId as keyof typeof ROLES] && ROLES[roleId as keyof typeof ROLES].priority > 0)
    .sort((a, b) => ROLES[b].priority - ROLES[a].priority);

  gameData.nightActions = {};
  gameData.pendingNightRoles = activeRoles as string[];
  gameData.currentNightRoleIndex = 0;
  gameData.nightActionSubmitted = new Set();
  gameData.wolfVotes = {};
  gameData.wolfVoteTimes = {};
  gameData.votes = {};

  promptNextNightRole(roomId, io);
};

export const promptNextNightRole = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;

  if (!pendingNightRoles || currentNightRoleIndex! >= pendingNightRoles.length) {
    resolveNight(roomId, io);
    return;
  }

  const currentRole = pendingNightRoles[currentNightRoleIndex!] as keyof typeof ROLES;
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  const rolePlayers = alivePlayers.filter(p => p.role === currentRole);

  if (rolePlayers.length === 0) {
    gameData.currentNightRoleIndex!++;
    promptNextNightRole(roomId, io);
    return;
  }

  const handler = RoleRegistry.getHandler(currentRole);
  if (handler && handler.promptNightAction) {
    rolePlayers.forEach(player => {
      const socket = io.sockets.sockets.get(player.id);
      if (socket) {
        handler.promptNightAction!(roomId, player, context, gameData, socket);
      }
    });

    io.to(roomId).emit('NIGHT_STATUS_UPDATE', {
      currentRoleName: ROLES[currentRole]?.name || currentRole
    });
  } else {
    // Nếu role chưa có handler prompt, chuyển luôn sang role tiếp
    gameData.currentNightRoleIndex!++;
    promptNextNightRole(roomId, io);
  }
};

export const submitNightAction = (roomId: string, actorId: string, targetId: string, io: Server): boolean => {
  const gameData = getGameData(roomId);
  if (!gameData) return false;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;
  if (!pendingNightRoles || currentNightRoleIndex! >= pendingNightRoles.length) return false;

  const currentRole = pendingNightRoles[currentNightRoleIndex!] as keyof typeof ROLES;
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;

  const actor = context.players.find(p => p.id === actorId);
  if (!actor || !actor.isAlive || actor.role !== currentRole) return false;

  const handler = RoleRegistry.getHandler(currentRole);
  if (handler && handler.submitNightAction) {
    const shouldAdvance = handler.submitNightAction(roomId, actor, targetId, context, gameData, io);
    if (shouldAdvance) {
      gameData.currentNightRoleIndex!++;
      promptNextNightRole(roomId, io);
      return true;
    }
  }

  return false;
};

export const submitCupidAction = (
  roomId: string,
  actorId: string,
  lover1Id: string,
  lover2Id: string,
  io: Server
): boolean => {
  const gameData = getGameData(roomId);
  if (!gameData) return false;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  
  const actor = context.players.find(p => p.id === actorId);
  if (!actor || actor.role !== 'CUPID') return false;

  const handler = RoleRegistry.getHandler('CUPID');
  if (handler && handler.submitNightAction) {
    // Truyền lover1Id làm targetId, lover2Id qua extraData
    return handler.submitNightAction(roomId, actor, lover1Id, context, gameData, io, { lover2Id });
  }
  return false;
};

export const submitWitchAction = (
  roomId: string,
  actorId: string,
  healTargetId: string | null,
  poisonTargetId: string | null,
  io: Server
): boolean => {
  const gameData = getGameData(roomId);
  if (!gameData) return false;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  
  const actor = context.players.find(p => p.id === actorId);
  if (!actor || actor.role !== 'WITCH') return false;

  const handler = RoleRegistry.getHandler('WITCH');
  if (handler && handler.submitNightAction) {
    const shouldAdvance = handler.submitNightAction(roomId, actor, healTargetId, context, gameData, io, { poisonTargetId });
    if (shouldAdvance) {
      gameData.currentNightRoleIndex!++;
      promptNextNightRole(roomId, io);
      return true;
    }
  }
  return false;
};

export const resolveNight = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const deaths = new Set<string>();

  // Để từng Role handler xử lý logic chết (Sói cắn, Phù thuỷ cứu/độc, Bảo vệ)
  const handlers = RoleRegistry.getAllHandlers();
  for (const [, handler] of handlers) {
    if (handler.resolveNight) {
      handler.resolveNight(roomId, context, gameData, deaths, io);
    }
  }

  const nightDeaths: Player[] = [];
  deaths.forEach(id => {
    const p = context.players.find(x => x.id === id);
    if (p) {
      nightDeaths.push({
        id: p.id,
        name: p.name,
        role: p.role,
        isAlive: false
      });
    }
  });

  gameData.actor.send({
    type: 'ALL_NIGHT_ACTIONS_DONE',
    nightDeaths
  });
};
