import type { Server } from 'socket.io';
import { getGameData, setGameTimer } from '../engine/gameStateManager.ts';
import { ROLES } from '../roles/index.ts';
import type { Player, NightActionPayload, NightActionInput } from '../types/game.ts';
import { RoleRegistry } from '../roles/RoleHandler.ts';

// Chắc chắn các handler đã được đăng ký bằng cách import chúng
import '../roles/handlers/CupidHandler.ts';
import { computeWerewolfTarget } from '../roles/handlers/WerewolfHandler.ts';
import '../roles/handlers/WitchHandler.ts';
import '../roles/handlers/SeerHandler.ts';
import '../roles/handlers/BodyguardHandler.ts';
import '../roles/handlers/HunterHandler.ts';
import '../roles/handlers/ElderHandler.ts';
import '../roles/handlers/CursedHandler.ts';
import '../roles/handlers/DoppelgangerHandler.ts';

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
    const doppelgangerTargets: Record<string, string> = {};
    const doppelgangerAction = gameData.nightActions?.['DOPPELGANGER'];
    if (doppelgangerAction) {
      doppelgangerTargets[doppelgangerAction.actorId] = doppelgangerAction.targetId;
    }
    gameData.actor.send({ type: 'FIRST_NIGHT_DONE', doppelgangerTargets });
    return;
  }

  const currentRole = pendingNightRoles[currentNightRoleIndex] as keyof typeof ROLES;
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  const rolePlayers = alivePlayers.filter(p => p.role === currentRole);
  const connectedRolePlayers = rolePlayers.filter(p => io.sockets.sockets.has(p.id));

  if (connectedRolePlayers.length === 0) {
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

export const startNightWave1 = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  gameData.nightActions = {};
  gameData.nightActionSubmitted = new Set();
  gameData.wolfVotes = {};
  gameData.wolfVoteTimes = {};
  gameData.votes = {};

  const wave1Roles = ['WEREWOLF', 'SEER', 'BODYGUARD'];

  alivePlayers.forEach(player => {
    if (player.role && wave1Roles.includes(player.role)) {
      const handler = RoleRegistry.getHandler(player.role);
      const isSpecialVillager = ['SEER', 'BODYGUARD'].includes(player.role);
      const lostPowers = !!context.villagersLostPowers && isSpecialVillager;

      if (io.sockets.sockets.has(player.id) && !lostPowers) {
        if (handler && handler.promptNightAction) {
          const socket = io.sockets.sockets.get(player.id);
          if (socket) {
            handler.promptNightAction(roomId, player, context, gameData, socket);
          }
        }
      }
    }
  });

  io.to(roomId).emit('NIGHT_STATUS_UPDATE', {
    currentRoleName: 'các vai trò đặc biệt',
    waitingFor: [],
    done: []
  });
};

export const startNightWave2 = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;

  if (!gameData.nightActions?.['WEREWOLF']) {
    computeWerewolfTarget(context, gameData);
  }

  const witch = context.players.find(p => p.role === 'WITCH' && p.isAlive);
  const lostPowers = !!context.villagersLostPowers;

  if (witch && io.sockets.sockets.has(witch.id) && !lostPowers) {
    const handler = RoleRegistry.getHandler('WITCH');
    if (handler && handler.promptNightAction) {
      const socket = io.sockets.sockets.get(witch.id);
      if (socket) {
        handler.promptNightAction(roomId, witch, context, gameData, socket);
      }
    }
  }

  io.to(roomId).emit('NIGHT_STATUS_UPDATE', {
    currentRoleName: 'Phù Thủy',
    waitingFor: [],
    done: []
  });
};

export const submitNightAction = (
  roomId: string,
  actorId: string,
  payload: NightActionInput,
  io: Server
): boolean => {
  const gameData = getGameData(roomId);
  if (!gameData) return false;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const phase = snapshot.value;

  const actor = context.players.find(p => p.id === actorId);
  if (!actor || !actor.isAlive || !actor.role) return false;

  const currentRole = actor.role;

  if (phase === 'FirstNightPhase') {
    const { pendingNightRoles, currentNightRoleIndex } = gameData;
    if (!pendingNightRoles || currentNightRoleIndex === undefined) return false;
    if (currentNightRoleIndex >= pendingNightRoles.length) return false;

    const expectedRole = pendingNightRoles[currentNightRoleIndex];
    if (currentRole !== expectedRole) return false;

    const handler = RoleRegistry.getHandler(currentRole);
    if (handler && handler.submitNightAction) {
      const actionPayload = { role: currentRole, ...payload } as unknown as NightActionPayload;
      const valid = handler.submitNightAction(roomId, actor, actionPayload, context, gameData, io);
      if (valid) {
        gameData.currentNightRoleIndex = currentNightRoleIndex + 1;
        promptNextFirstNightRole(roomId, io);
        return true;
      }
    }
    return false;
  }

  const nightWave = context.nightWave;
  if (!nightWave) return false;

  const wave1Roles = ['WEREWOLF', 'SEER', 'BODYGUARD'];
  if (nightWave === 1 && !wave1Roles.includes(currentRole)) return false;
  if (nightWave === 2 && currentRole !== 'WITCH') return false;

  const handler = RoleRegistry.getHandler(currentRole);
  if (handler && handler.submitNightAction) {
    const actionPayload = { role: currentRole, ...payload } as unknown as NightActionPayload;
    return handler.submitNightAction(roomId, actor, actionPayload, context, gameData, io);
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
    const valid = handler.submitNightAction(roomId, actor, { role: 'CUPID', lover1Id, lover2Id }, context, gameData, io);
    if (valid && snapshot.value === 'FirstNightPhase' && gameData.currentNightRoleIndex !== undefined) {
      // Delay 5s để client hiện animation lovers reveal trước khi chuyển role
      setTimeout(() => {
        const gd = getGameData(roomId);
        if (gd && gd.actor.getSnapshot().value === 'FirstNightPhase') {
          gd.currentNightRoleIndex = (gd.currentNightRoleIndex ?? 0) + 1;
          promptNextFirstNightRole(roomId, io);
        }
      }, 5000);
    }
    return valid;
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

  // Thứ tự resolveNight rất quan trọng (Order Dependency):
  // 1. WEREWOLF cắn (thêm vào deaths)
  // 2. BODYGUARD bảo vệ (xóa khỏi deaths) -> chặn Sói cắn
  // 3. WITCH cứu/độc (xóa khỏi deaths / thêm vào deaths) -> Độc của phù thủy không bị chặn bởi bảo vệ
  const resolveOrder = ['WEREWOLF', 'BODYGUARD', 'WITCH', 'HUNTER', 'ELDER', 'CUPID', 'SEER', 'CURSED', 'DOPPELGANGER'];
  
  // Chạy các handler theo thứ tự định sẵn
  for (const roleId of resolveOrder) {
    const handler = RoleRegistry.getHandler(roleId as import('../types/game.ts').Role);
    if (handler && handler.resolveNight) {
      handler.resolveNight(roomId, context, gameData, deaths, io);
    }
  }

  // Chạy nốt các handler còn lại nếu chưa có trong danh sách (để an toàn)
  const handlers = RoleRegistry.getAllHandlers();
  for (const [role, handler] of handlers) {
    if (!resolveOrder.includes(role) && handler.resolveNight) {
      handler.resolveNight(roomId, context, gameData, deaths, io);
    }
  }

  const nightDeaths: Player[] = [];
  const transformedIds: string[] = [];
  
  // Xử lý khiên của Già Làng trước Ma Sói
  let nextElderShields = context.elderShields !== undefined ? context.elderShields : 1;
  const elder = context.players.find(p => p.role === 'ELDER' && p.isAlive);
  if (elder) {
    const werewolfTargetId = gameData.nightActions?.['WEREWOLF']?.targetId;
    const isElderBitten = werewolfTargetId === elder.id;
    const wasHealed = gameData.nightActions?.['WITCH_HEAL']?.targetId === elder.id;
    const wasProtected = gameData.nightActions?.['BODYGUARD']?.targetId === elder.id;
    const wasPoisoned = gameData.nightActions?.['WITCH_POISON']?.targetId === elder.id;

    if (isElderBitten && !wasHealed && !wasProtected) {
      if (nextElderShields > 0) {
        nextElderShields = 0;
        if (!wasPoisoned) {
          deaths.delete(elder.id);
        }
        io.to(roomId).emit('ELDER_SHIELD_BROKEN', { elderId: elder.id });
      }
    }
  }

  // Xử lý Hóa Sói của Kẻ Bị Nguyền Rủa
  const cursedPlayers = context.players.filter(p => p.role === 'CURSED' && p.isAlive);
  cursedPlayers.forEach(cursed => {
    const werewolfTargetId = gameData.nightActions?.['WEREWOLF']?.targetId;
    const isCursedBitten = werewolfTargetId === cursed.id;
    const wasProtected = gameData.nightActions?.['BODYGUARD']?.targetId === cursed.id;
    const wasPoisoned = gameData.nightActions?.['WITCH_POISON']?.targetId === cursed.id;

    if (isCursedBitten && !wasProtected) {
      if (!wasPoisoned) {
        deaths.delete(cursed.id);
        transformedIds.push(cursed.id);
        io.to(roomId).emit('CURSED_TRANSFORMED', { playerId: cursed.id });

        // Cập nhật lại Seer vision cache: nếu Tiên Tri đã soi người này, kết quả giờ thành Sói
        if (gameData.seerVisions) {
          for (const seerId in gameData.seerVisions) {
            const vision = gameData.seerVisions[seerId].find(v => v.targetId === cursed.id);
            if (vision) {
              vision.isWerewolf = true;
              // Bắn event để client của Tiên Tri (nếu đang online) có thể cập nhật ngay lập tức
              const seerSocket = io.sockets.sockets.get(seerId);
              if (seerSocket) {
                seerSocket.emit('SEER_RESULT', {
                  targetId: cursed.id,
                  targetName: cursed.name,
                  isWerewolf: true
                });
              }
            }
          }
        }
      }
    }
  });

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
    nightDeaths,
    elderShields: nextElderShields,
    transformedIds,
    nightActions: gameData.nightActions
  });
};

/**
 * Xử lý ngắt kết nối trong đêm: Chỉ chạy trong FirstNightPhase (vì các Wave của NightPhase chạy timer tự động)
 */
export const handleNightPlayerDisconnect = (roomId: string, playerId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const phase = snapshot.value;

  if (phase !== 'FirstNightPhase') return;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;
  if (!pendingNightRoles || currentNightRoleIndex === undefined) return;
  if (currentNightRoleIndex >= pendingNightRoles.length) return;

  const currentRole = pendingNightRoles[currentNightRoleIndex] as keyof typeof ROLES;
  const context = snapshot.context;

  // Tìm người chơi đã disconnect trong context
  const player = context.players.find((p) => p.id === playerId);
  if (!player || player.role !== currentRole || !player.isAlive) return;

  // Kiểm tra xem còn người chơi nào khác cùng role này đang online hay không
  const alivePlayers = context.players.filter((p) => p.isAlive && p.role === currentRole);
  const connectedPlayers = alivePlayers.filter((p) => p.id !== playerId && io.sockets.sockets.has(p.id));

  if (connectedPlayers.length === 0) {
    const delay = 10000;
    setGameTimer(roomId, delay, () => {
      const refreshedGameData = getGameData(roomId);
      if (!refreshedGameData) return;

      const currentSnapshot = refreshedGameData.actor.getSnapshot();
      if (
        currentSnapshot.value === 'FirstNightPhase' &&
        refreshedGameData.currentNightRoleIndex === currentNightRoleIndex
      ) {
        // Kiểm tra lại xem họ đã kết nối lại hay chưa
        const currentContext = currentSnapshot.context;
        const activeRole = refreshedGameData.pendingNightRoles![currentNightRoleIndex] as keyof typeof ROLES;
        const currentAlivePlayers = currentContext.players.filter((p) => p.isAlive && p.role === activeRole);
        const currentConnectedPlayers = currentAlivePlayers.filter((p) => io.sockets.sockets.has(p.id));

        if (currentConnectedPlayers.length === 0) {
          refreshedGameData.currentNightRoleIndex = currentNightRoleIndex + 1;
          promptNextFirstNightRole(roomId, io);
        }
      }
    });
  }
};
