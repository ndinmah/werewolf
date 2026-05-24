import { getGameData } from '../engine/gameStateManager.js';
import { ROLES } from '../roles/index.js';

/**
 * Bắt đầu pha ban đêm cho một phòng game
 */
export const startNight = (roomId, io) => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  // Lọc các role có priority > 0 và đang có người chơi còn sống sở hữu role đó
  const activeRoles = [...new Set(alivePlayers.map(p => p.role))]
    .filter(roleId => ROLES[roleId] && ROLES[roleId].priority > 0)
    .sort((a, b) => ROLES[b].priority - ROLES[a].priority); // Sort giảm dần (Bảo vệ -> Tiên tri -> Sói)

  gameData.nightActions = {};
  gameData.pendingNightRoles = activeRoles;
  gameData.currentNightRoleIndex = 0;

  // Reset votes
  gameData.votes = {};

  promptNextNightRole(roomId, io);
};

/**
 * Gửi yêu cầu hành động cho role tiếp theo trong hàng đợi
 */
export const promptNextNightRole = (roomId, io) => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;

  // Nếu đã hết các role cần hành động
  if (!pendingNightRoles || currentNightRoleIndex >= pendingNightRoles.length) {
    resolveNight(roomId, io);
    return;
  }

  const currentRole = pendingNightRoles[currentNightRoleIndex];
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  // Tìm những người chơi còn sống có role này
  const rolePlayers = alivePlayers.filter(p => p.role === currentRole);

  if (rolePlayers.length === 0) {
    // Không có ai có role này còn sống (an toàn), chuyển sang role tiếp theo
    gameData.currentNightRoleIndex++;
    promptNextNightRole(roomId, io);
    return;
  }

  // Gửi prompt cho từng người chơi của role này
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

  // Thông báo chung cho phòng: Đang chờ role cụ thể hành động (ẩn tên người chơi)
  io.to(roomId).emit('NIGHT_STATUS_UPDATE', {
    currentRoleName: ROLES[currentRole]?.name || currentRole
  });
};

/**
 * Nhận hành động ban đêm từ một người chơi
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

  // Kiểm tra luật bảo vệ không được trùng 2 đêm liên tiếp
  if (currentRole === 'BODYGUARD' && targetId === gameData.lastProtectedId) {
    return false;
  }

  // Ghi nhận action
  gameData.nightActions[currentRole] = { actorId, targetId };

  // Đối với Ma sói, thông báo cho các con sói khác biết target được chọn
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

  // Chuyển sang role tiếp theo
  gameData.currentNightRoleIndex++;
  promptNextNightRole(roomId, io);
  return true;
};

/**
 * Xử lý kết quả ban đêm
 */
export const resolveNight = (roomId, io) => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const { nightActions } = gameData;
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;

  let killedId = nightActions['WEREWOLF']?.targetId;
  let protectedId = nightActions['BODYGUARD']?.targetId;

  // Cập nhật lastProtectedId
  gameData.lastProtectedId = protectedId || null;

  const nightDeaths = [];

  // Nếu có người bị cắn và người đó không được bảo vệ
  if (killedId && killedId !== protectedId) {
    const victim = context.players.find(p => p.id === killedId);
    if (victim) {
      nightDeaths.push({
        id: victim.id,
        name: victim.name,
        role: victim.role
      });
    }
  }

  // Xử lý Tiên tri soi bài
  if (nightActions['SEER']) {
    const seerAction = nightActions['SEER'];
    const seerPlayer = context.players.find(p => p.id === seerAction.actorId);
    const targetPlayer = context.players.find(p => p.id === seerAction.targetId);

    if (seerPlayer && targetPlayer) {
      const isWerewolf = targetPlayer.role === 'WEREWOLF';
      
      // Gửi kết quả soi về riêng cho Tiên tri
      const seerSocket = io.sockets.sockets.get(seerPlayer.id);
      if (seerSocket) {
        seerSocket.emit('SEER_RESULT', {
          targetId: targetPlayer.id,
          targetName: targetPlayer.name,
          isWerewolf
        });
      }

      // Lưu trữ vision để phục vụ reconnect
      if (!gameData.seerVisions) gameData.seerVisions = {};
      if (!gameData.seerVisions[seerPlayer.id]) gameData.seerVisions[seerPlayer.id] = [];
      gameData.seerVisions[seerPlayer.id].push({
        targetId: targetPlayer.id,
        targetName: targetPlayer.name,
        isWerewolf
      });
    }
  }

  // Gửi kết quả về Machine để chuyển trạng thái game
  gameData.actor.send({
    type: 'ALL_NIGHT_ACTIONS_DONE',
    nightDeaths
  });
};
