import { getGameData } from '../engine/gameStateManager.ts';
import { ROLES } from '../roles/index.ts';
import type { Player } from '../types/game.ts';

/**
 * Báº¯t Ä‘áº§u pha ban Ä‘Ãªm cho má»™t phÃ²ng game
 */
export const startNight = (roomId, io) => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  // Lá»c cÃ¡c role cÃ³ priority > 0 vÃ  Ä‘ang cÃ³ ngÆ°á»i chÆ¡i cÃ²n sá»‘ng sá»Ÿ há»¯u role Ä‘Ã³
  const activeRoles = [...new Set(alivePlayers.map(p => p.role))]
    .filter((roleId): roleId is string => typeof roleId === 'string' && !!ROLES[roleId] && ROLES[roleId].priority > 0)
    .sort((a, b) => ROLES[b].priority - ROLES[a].priority); // Sort giảm dần (Bảo vệ -> Tiên tri -> Sói)

  gameData.nightActions = {};
  gameData.pendingNightRoles = activeRoles;
  gameData.currentNightRoleIndex = 0;

  // Reset votes
  gameData.votes = {};

  promptNextNightRole(roomId, io);
};

/**
 * Gá»­i yÃªu cáº§u hÃ nh Ä‘á»™ng cho role tiáº¿p theo trong hÃ ng Ä‘á»£i
 */
export const promptNextNightRole = (roomId, io) => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;

  // Náº¿u Ä‘Ã£ háº¿t cÃ¡c role cáº§n hÃ nh Ä‘á»™ng
  if (!pendingNightRoles || currentNightRoleIndex >= pendingNightRoles.length) {
    resolveNight(roomId, io);
    return;
  }

  const currentRole = pendingNightRoles[currentNightRoleIndex];
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  // TÃ¬m nhá»¯ng ngÆ°á»i chÆ¡i cÃ²n sá»‘ng cÃ³ role nÃ y
  const rolePlayers = alivePlayers.filter(p => p.role === currentRole);

  if (rolePlayers.length === 0) {
    // KhÃ´ng cÃ³ ai cÃ³ role nÃ y cÃ²n sá»‘ng (an toÃ n), chuyá»ƒn sang role tiáº¿p theo
    gameData.currentNightRoleIndex++;
    promptNextNightRole(roomId, io);
    return;
  }

  // Gá»­i prompt cho tá»«ng ngÆ°á»i chÆ¡i cá»§a role nÃ y
  rolePlayers.forEach(player => {
    const socket = io.sockets.sockets.get(player.id);
    if (socket) {
      socket.emit('NIGHT_ACTION_PROMPT', {
        role: currentRole,
        targetablePlayers: alivePlayers.map(p => ({
          id: p.id,
          name: p.name,
          isAlive: p.isAlive
        })),
        excludeTargetId: currentRole === 'BODYGUARD' ? gameData.lastProtectedId : null
      });
    }
  });

  // ThÃ´ng bÃ¡o chung cho phÃ²ng: Äang chá» role cá»¥ thá»ƒ hÃ nh Ä‘á»™ng (áº©n tÃªn ngÆ°á»i chÆ¡i)
  io.to(roomId).emit('NIGHT_STATUS_UPDATE', {
    currentRoleName: ROLES[currentRole]?.name || currentRole
  });
};

/**
 * Nháº­n hÃ nh Ä‘á»™ng ban Ä‘Ãªm tá»« má»™t ngÆ°á»i chÆ¡i
 */
export const submitNightAction = (roomId, actorId, targetId, io) => {
  const gameData = getGameData(roomId);
  if (!gameData) return false;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;
  if (!pendingNightRoles || currentNightRoleIndex >= pendingNightRoles.length) return false;

  const currentRole = pendingNightRoles[currentNightRoleIndex];
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;

  const actor = context.players.find(p => p.id === actorId);
  if (!actor || !actor.isAlive || actor.role !== currentRole) return false;

  const target = context.players.find(p => p.id === targetId);
  if (targetId && (!target || !target.isAlive)) return false;

  // Kiá»ƒm tra luáº­t báº£o vá»‡ khÃ´ng Ä‘Æ°á»£c trÃ¹ng 2 Ä‘Ãªm liÃªn tiáº¿p
  if (currentRole === 'BODYGUARD' && targetId === gameData.lastProtectedId) {
    return false;
  }

  // Ghi nháº­n action
  gameData.nightActions[currentRole] = { actorId, targetId };

  // Äá»‘i vá»›i Ma sÃ³i, thÃ´ng bÃ¡o cho cÃ¡c con sÃ³i khÃ¡c biáº¿t target Ä‘Æ°á»£c chá»n
  if (currentRole === 'WEREWOLF') {
    const wolves = context.players.filter(p => p.role === 'WEREWOLF' && p.isAlive);
    wolves.forEach(w => {
      if (w.id !== actorId) {
        const socket = io.sockets.sockets.get(w.id);
        if (socket) {
          socket.emit('WOLF_TARGET_SELECTED', { targetId, actorName: actor.name });
        }
      }
    });
  }

  // Chuyá»ƒn sang role tiáº¿p theo
  gameData.currentNightRoleIndex++;
  promptNextNightRole(roomId, io);
  return true;
};

/**
 * Xá»­ lÃ½ káº¿t quáº£ ban Ä‘Ãªm
 */
export const resolveNight = (roomId, io) => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const { nightActions } = gameData;
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;

  let killedId = nightActions['WEREWOLF']?.targetId;
  let protectedId = nightActions['BODYGUARD']?.targetId;

  // Cáº­p nháº­t lastProtectedId
  gameData.lastProtectedId = protectedId || null;

  const nightDeaths: Player[] = [];

  // Náº¿u cÃ³ ngÆ°á»i bá»‹ cáº¯n vÃ  ngÆ°á»i Ä‘Ã³ khÃ´ng Ä‘Æ°á»£c báº£o vá»‡
  if (killedId && killedId !== protectedId) {
    const victim = context.players.find(p => p.id === killedId);
    if (victim) {
      nightDeaths.push({
        id: victim.id,
        name: victim.name,
        role: victim.role,
        isAlive: false
      });
    }
  }

  // Xá»­ lÃ½ TiÃªn tri soi bÃ i
  if (nightActions['SEER']) {
    const seerAction = nightActions['SEER'];
    const seerPlayer = context.players.find(p => p.id === seerAction.actorId);
    const targetPlayer = context.players.find(p => p.id === seerAction.targetId);

    if (seerPlayer && targetPlayer) {
      const isWerewolf = targetPlayer.role === 'WEREWOLF';
      
      // Gá»­i káº¿t quáº£ soi vá» riÃªng cho TiÃªn tri
      const seerSocket = io.sockets.sockets.get(seerPlayer.id);
      if (seerSocket) {
        seerSocket.emit('SEER_RESULT', {
          targetId: targetPlayer.id,
          targetName: targetPlayer.name,
          isWerewolf
        });
      }

      // LÆ°u trá»¯ vision Ä‘á»ƒ phá»¥c vá»¥ reconnect
      if (!gameData.seerVisions) gameData.seerVisions = {};
      if (!gameData.seerVisions[seerPlayer.id]) gameData.seerVisions[seerPlayer.id] = [];
      gameData.seerVisions[seerPlayer.id].push({
        targetId: targetPlayer.id,
        targetName: targetPlayer.name,
        isWerewolf
      });
    }
  }

  // Gá»­i káº¿t quáº£ vá» Machine Ä‘á»ƒ chuyá»ƒn tráº¡ng thÃ¡i game
  gameData.actor.send({
    type: 'ALL_NIGHT_ACTIONS_DONE',
    nightDeaths
  });
};
