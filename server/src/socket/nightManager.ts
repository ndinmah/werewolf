import type { Server } from 'socket.io';
import { getGameData } from '../engine/gameStateManager.ts';
import { ROLES } from '../roles/index.ts';
import type { Player, NightActionPayload, NightActionInput } from '../types/game.ts';
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

  // Tìm các role cần hành động trong First Night dựa trên firstNightPriority > 0
  const firstNightRoles = [...new Set(alivePlayers.map(p => p.role))]
    .filter((roleId): roleId is keyof typeof ROLES => {
      if (typeof roleId !== 'string' || !ROLES[roleId as keyof typeof ROLES]) return false;
      const roleConfig = ROLES[roleId as keyof typeof ROLES] as unknown as { firstNightPriority?: number };
      return typeof roleConfig.firstNightPriority === 'number' && roleConfig.firstNightPriority > 0;
    })
    .sort((a, b) => {
      const configA = ROLES[a as keyof typeof ROLES] as unknown as { firstNightPriority?: number };
      const configB = ROLES[b as keyof typeof ROLES] as unknown as { firstNightPriority?: number };
      return (configB.firstNightPriority || 0) - (configA.firstNightPriority || 0);
    });

  gameData.pendingNightRoles = firstNightRoles as string[];
  gameData.currentNightRoleIndex = 0;

  promptNextFirstNightRole(roomId, io);
};

export const promptNextFirstNightRole = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;
  if (!pendingNightRoles || currentNightRoleIndex === undefined) return;

  if (currentNightRoleIndex >= pendingNightRoles.length) {
    // Kết thúc đêm đầu tiên, báo cho XState machine
    gameData.actor.send({ type: 'FIRST_NIGHT_DONE' });
    return;
  }

  const currentRole = pendingNightRoles[currentNightRoleIndex] as keyof typeof ROLES;
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  const rolePlayers = alivePlayers.filter(p => p.role === currentRole);

  if (rolePlayers.length === 0) {
    gameData.currentNightRoleIndex = currentNightRoleIndex + 1;
    promptNextFirstNightRole(roomId, io);
    return;
  }

  const handler = RoleRegistry.getHandler(currentRole);
  if (handler && handler.onFirstNightStart) {
    handler.onFirstNightStart(roomId, context, gameData, io);
  } else {
    // Nếu role không có onFirstNightStart, tự động chuyển tiếp
    gameData.currentNightRoleIndex = currentNightRoleIndex + 1;
    promptNextFirstNightRole(roomId, io);
  }
};

export const advanceFirstNightRole = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData || gameData.currentNightRoleIndex === undefined) return;
  gameData.currentNightRoleIndex++;
  promptNextFirstNightRole(roomId, io);
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
  if (!pendingNightRoles || currentNightRoleIndex === undefined) return;

  if (currentNightRoleIndex >= pendingNightRoles.length) {
    resolveNight(roomId, io);
    return;
  }

  const currentRole = pendingNightRoles[currentNightRoleIndex] as keyof typeof ROLES;
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  const rolePlayers = alivePlayers.filter(p => p.role === currentRole);

  if (rolePlayers.length === 0) {
    gameData.currentNightRoleIndex = currentNightRoleIndex + 1;
    promptNextNightRole(roomId, io);
    return;
  }

  const handler = RoleRegistry.getHandler(currentRole);
  if (handler && handler.promptNightAction) {
    const promptAction = handler.promptNightAction;
    rolePlayers.forEach(player => {
      const socket = io.sockets.sockets.get(player.id);
      if (socket) {
        promptAction(roomId, player, context, gameData, socket);
      }
    });

    io.to(roomId).emit('NIGHT_STATUS_UPDATE', {
      currentRoleName: ROLES[currentRole]?.name || currentRole
    });
  } else {
    // Nếu role chưa có handler prompt, chuyển luôn sang role tiếp
    gameData.currentNightRoleIndex = currentNightRoleIndex + 1;
    promptNextNightRole(roomId, io);
  }
};

export const submitNightAction = (
  roomId: string,
  actorId: string,
  payload: NightActionInput,
  io: Server
): boolean => {
  const gameData = getGameData(roomId);
  if (!gameData) return false;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;
  if (!pendingNightRoles || currentNightRoleIndex === undefined) return false;
  if (currentNightRoleIndex >= pendingNightRoles.length) return false;

  const currentRole = pendingNightRoles[currentNightRoleIndex] as keyof typeof ROLES;
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;

  const actor = context.players.find(p => p.id === actorId);
  if (!actor || !actor.isAlive || actor.role !== currentRole) return false;

  const handler = RoleRegistry.getHandler(currentRole);
  if (handler && handler.submitNightAction) {
    const actionPayload = { role: currentRole, ...payload } as unknown as NightActionPayload;
    const shouldAdvance = handler.submitNightAction(roomId, actor, actionPayload, context, gameData, io);
    if (shouldAdvance) {
      gameData.currentNightRoleIndex = currentNightRoleIndex + 1;
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
    return handler.submitNightAction(roomId, actor, { role: 'CUPID', lover1Id, lover2Id }, context, gameData, io);
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
  return submitNightAction(roomId, actorId, { healTargetId, poisonTargetId }, io);
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
