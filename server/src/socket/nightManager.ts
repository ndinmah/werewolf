import type { Server } from 'socket.io';
import { getGameData } from '../engine/gameStateManager.ts';
import { ROLES } from '../roles/index.ts';
import type { Player } from '../types/game.ts';

/**
 * Bắt đầu pha ban đêm đầu tiên (First Night)
 */
export const startFirstNight = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  gameData.nightActions = {};
  gameData.nightActionSubmitted = new Set();
  gameData.votes = {};

  const cupid = alivePlayers.find(p => p.role === 'CUPID');

  if (cupid) {
    // Nếu có CUPID, chờ CUPID chọn đôi
    const socket = io.sockets.sockets.get(cupid.id);
    if (socket) {
      socket.emit('NIGHT_ACTION_PROMPT', {
        role: 'CUPID',
        targetablePlayers: alivePlayers.map(p => ({
          id: p.id,
          name: p.name,
          isAlive: p.isAlive
        })),
      });
    }
    io.to(roomId).emit('NIGHT_STATUS_UPDATE', { currentRoleName: 'Cupid' });
    
    // Fallback timeout nếu Cupid không chọn (ví dụ 30s)
    setTimeout(() => {
      const currentGameData = getGameData(roomId);
      if (currentGameData && currentGameData.actor.getSnapshot().value === 'FirstNightPhase') {
        resolveFirstNightWolves(roomId, io);
      }
    }, 30000);
  } else {
    // Không có CUPID, tiến hành cho Sói nhận diện luôn
    resolveFirstNightWolves(roomId, io);
  }
};

/**
 * Xử lý cho Sói nhận diện nhau trong First Night
 */
export const resolveFirstNightWolves = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  const wolves = alivePlayers.filter(p => p.role === 'WEREWOLF');

  // Cho các sói nhìn thấy nhau
  wolves.forEach(w => {
    const socket = io.sockets.sockets.get(w.id);
    if (socket) {
      const teammates = wolves.filter(wolf => wolf.id !== w.id).map(wolf => ({
        id: wolf.id,
        name: wolf.name
      }));
      socket.emit('FIRST_NIGHT_WOLF_REVEAL', { teammates });
    }
  });

  io.to(roomId).emit('NIGHT_STATUS_UPDATE', { currentRoleName: 'Ma Sói' });

  // Sói có 10s để nhìn mặt nhau
  setTimeout(() => {
    const currentGameData = getGameData(roomId);
    if (currentGameData && currentGameData.actor.getSnapshot().value === 'FirstNightPhase') {
      currentGameData.actor.send({ type: 'FIRST_NIGHT_DONE' });
    }
  }, 10000);
};

/**
 * Bắt đầu pha ban đêm cho một phòng game
 */
export const startNight = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  // Lọc các role có priority > 0 và đang có người chơi còn sống sở hữu role đó
  const activeRoles = [...new Set(alivePlayers.map(p => p.role))]
    .filter((roleId): roleId is keyof typeof ROLES => typeof roleId === 'string' && !!ROLES[roleId as keyof typeof ROLES] && ROLES[roleId as keyof typeof ROLES].priority > 0)
    .sort((a, b) => ROLES[b].priority - ROLES[a].priority); // Sort giảm dần (Bảo vệ -> Tiên tri -> Sói -> Phù Thủy)

  gameData.nightActions = {};
  gameData.pendingNightRoles = activeRoles as string[];
  gameData.currentNightRoleIndex = 0;
  // Reset rate limiting đêm mới
  gameData.nightActionSubmitted = new Set();
  gameData.wolfVotes = {};
  gameData.wolfVoteTimes = {};

  // Reset votes
  gameData.votes = {};

  promptNextNightRole(roomId, io);
};

/**
 * Gửi yêu cầu hành động cho role tiếp theo trong hàng đợi
 */
export const promptNextNightRole = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;

  // Nếu đã hết các role cần hành động
  if (!pendingNightRoles || currentNightRoleIndex! >= pendingNightRoles.length) {
    resolveNight(roomId, io);
    return;
  }

  const currentRole = pendingNightRoles[currentNightRoleIndex!];
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  const alivePlayers = context.players.filter(p => p.isAlive);

  // Tìm những người chơi còn sống có role này
  const rolePlayers = alivePlayers.filter(p => p.role === currentRole);

  if (rolePlayers.length === 0) {
    // Không có ai có role này còn sống, chuyển sang role tiếp theo
    gameData.currentNightRoleIndex!++;
    promptNextNightRole(roomId, io);
    return;
  }

  // Gửi prompt cho từng người chơi của role này
  rolePlayers.forEach(player => {
    const socket = io.sockets.sockets.get(player.id);
    if (socket) {
      if (currentRole === 'WITCH') {
        // Phù thủy nhận thông tin đặc biệt: nạn nhân của sói và quyền năng còn lại
        const werewolfTarget = gameData.nightActions!['WEREWOLF']?.targetId || null;
        const isSelfBitten = werewolfTarget === player.id;
        const canHeal = !gameData.witchHealUsed && (!isSelfBitten || context.dayCount === 1);

        socket.emit('NIGHT_ACTION_PROMPT', {
          role: currentRole,
          targetablePlayers: alivePlayers.map(p => ({
            id: p.id,
            name: p.name,
            isAlive: p.isAlive
          })),
          excludeTargetId: null,
          // Thông tin riêng cho WITCH
          witchInfo: {
            werewolfVictimId: werewolfTarget,
            canHeal,
            canPoison: !gameData.witchPoisonUsed,
          }
        });
      } else {
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
    }
  });

  // Thông báo chung cho phòng: Đang chờ role cụ thể hành động (ẩn tên người chơi)
  io.to(roomId).emit('NIGHT_STATUS_UPDATE', {
    currentRoleName: ROLES[currentRole as keyof typeof ROLES]?.name || currentRole
  });
};

/**
 * Nhận hành động ban đêm từ một người chơi (các role thông thường)
 */
export const submitNightAction = (roomId: string, actorId: string, targetId: string, io: Server): boolean => {
  const gameData = getGameData(roomId);
  if (!gameData) return false;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;
  if (!pendingNightRoles || currentNightRoleIndex! >= pendingNightRoles.length) return false;

  const currentRole = pendingNightRoles[currentNightRoleIndex!];
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;

  const actor = context.players.find(p => p.id === actorId);
  if (!actor || !actor.isAlive || actor.role !== currentRole) return false;

  // Rate limiting: mỗi player chỉ submit 1 lần mỗi đêm
  if (gameData.nightActionSubmitted.has(actorId)) return false;

  const target = context.players.find(p => p.id === targetId);
  if (targetId && (!target || !target.isAlive)) return false;

  // Kiểm tra luật bảo vệ không được trùng 2 đêm liên tiếp
  if (currentRole === 'BODYGUARD' && targetId === gameData.lastProtectedId) {
    return false;
  }

  // Ghi nhận rate limit
  gameData.nightActionSubmitted.add(actorId);

  // Ghi nhận action
  if (currentRole !== 'WEREWOLF') {
    gameData.nightActions![currentRole] = { actorId, targetId };
  } else {
    const wolfVotes = gameData.wolfVotes || {};
    const wolfVoteTimes = gameData.wolfVoteTimes || {};
    wolfVotes[actorId] = targetId;
    wolfVoteTimes[actorId] = Date.now();
    gameData.wolfVotes = wolfVotes;
    gameData.wolfVoteTimes = wolfVoteTimes;
  }

  // Xử lý Tiên tri soi bài ngay lập tức khi submit
  if (currentRole === 'SEER') {
    const targetPlayer = context.players.find(p => p.id === targetId);
    if (targetPlayer) {
      const isWerewolf = targetPlayer.role === 'WEREWOLF';
      const seerSocket = io.sockets.sockets.get(actorId);
      if (seerSocket) {
        seerSocket.emit('SEER_RESULT', {
          targetId: targetPlayer.id,
          targetName: targetPlayer.name,
          isWerewolf
        });
      }

      if (!gameData.seerVisions) gameData.seerVisions = {};
      if (!gameData.seerVisions[actorId]) gameData.seerVisions[actorId] = [];
      if (!gameData.seerVisions[actorId].some(v => v.targetId === targetPlayer.id)) {
        gameData.seerVisions[actorId].push({
          targetId: targetPlayer.id,
          targetName: targetPlayer.name,
          isWerewolf
        });
      }
    }
  }

  // Đối với Ma sói, phát sóng kết quả vote cập nhật cho tất cả Sói sống
  if (currentRole === 'WEREWOLF') {
    const wolves = context.players.filter(p => p.role === 'WEREWOLF' && p.isAlive);
    const submittedWolfIds = wolves.map(w => w.id).filter(id => gameData.nightActionSubmitted.has(id));
    const wolfVotes = gameData.wolfVotes || {};
    const wolfVoteTimes = gameData.wolfVoteTimes || {};

    wolves.forEach(w => {
      const socket = io.sockets.sockets.get(w.id);
      if (socket) {
        socket.emit('WOLF_VOTE_UPDATED', {
          votes: wolfVotes,
          submitted: submittedWolfIds
        });
      }
    });

    const allWolvesSubmitted = wolves.every(w => gameData.nightActionSubmitted.has(w.id));
    if (!allWolvesSubmitted) {
      // Chưa chốt hết, giữ nguyên trạng thái chưa qua đêm
      return true;
    }

    // Đã chốt hết, tính đa số
    const tally: Record<string, number> = {};
    wolves.forEach(w => {
      const tId = wolfVotes[w.id];
      if (tId) {
        tally[tId] = (tally[tId] || 0) + 1;
      }
    });

    let maxVotes = 0;
    let candidates: string[] = [];
    Object.entries(tally).forEach(([tId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        candidates = [tId];
      } else if (count === maxVotes) {
        candidates.push(tId);
      }
    });

    let finalTargetId: string | null = null;
    if (candidates.length === 1) {
      finalTargetId = candidates[0];
    } else if (candidates.length > 1) {
      // Bằng phiếu: lấy theo người submit trước
      let earliestTime = Infinity;
      candidates.forEach(tId => {
        const voters = wolves.filter(w => wolfVotes[w.id] === tId);
        voters.forEach(w => {
          const voteTime = wolfVoteTimes[w.id] || Infinity;
          if (voteTime < earliestTime) {
            earliestTime = voteTime;
            finalTargetId = tId;
          }
        });
      });
    }

    if (finalTargetId) {
      gameData.nightActions!['WEREWOLF'] = { actorId: 'WEREWOLF', targetId: finalTargetId };
    }
  }

  // Chuyển sang role tiếp theo
  gameData.currentNightRoleIndex!++;
  promptNextNightRole(roomId, io);
  return true;
};

/**
 * Nhận hành động của Cupid (chọn 2 người tình)
 */
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

  if (snapshot.value !== 'FirstNightPhase') return false;

  const actor = context.players.find(p => p.id === actorId);
  if (!actor || !actor.isAlive || actor.role !== 'CUPID') return false;

  // Validate lovers
  const lover1 = context.players.find(p => p.id === lover1Id);
  const lover2 = context.players.find(p => p.id === lover2Id);
  if (!lover1 || !lover2 || !lover1.isAlive || !lover2.isAlive || lover1Id === lover2Id) {
    return false;
  }

  // Rate limiting (chỉ 1 lần submit)
  if (gameData.nightActionSubmitted.has(actorId)) return false;
  gameData.nightActionSubmitted.add(actorId);

  // Lưu lovers vào context
  context.lovers = [lover1Id, lover2Id];

  // Cupid xong, chuyển sang cho sói nhận diện
  resolveFirstNightWolves(roomId, io);
  return true;
};

/**
 * Nhận hành động của Phù Thủy (heal và/hoặc poison)
 */
export const submitWitchAction = (
  roomId: string,
  actorId: string,
  healTargetId: string | null,
  poisonTargetId: string | null,
  io: Server
): boolean => {
  const gameData = getGameData(roomId);
  if (!gameData) return false;

  const { pendingNightRoles, currentNightRoleIndex } = gameData;
  if (!pendingNightRoles || currentNightRoleIndex! >= pendingNightRoles.length) return false;

  const currentRole = pendingNightRoles[currentNightRoleIndex!];
  if (currentRole !== 'WITCH') return false;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;

  const actor = context.players.find(p => p.id === actorId);
  if (!actor || !actor.isAlive || actor.role !== 'WITCH') return false;

  // Rate limiting
  if (gameData.nightActionSubmitted.has(actorId)) return false;
  gameData.nightActionSubmitted.add(actorId);

  // Validate: chỉ được dùng quyền còn lại
  if (healTargetId && gameData.witchHealUsed) return false;
  if (poisonTargetId && gameData.witchPoisonUsed) return false;

  // Validation chi tiết cho việc cứu:
  if (healTargetId) {
    // 1. Phải cứu đúng nạn nhân của sói cắn
    const werewolfTarget = gameData.nightActions!['WEREWOLF']?.targetId || null;
    if (healTargetId !== werewolfTarget) return false;

    // 2. Chỉ được tự cứu ở đêm đầu tiên (dayCount === 1)
    if (healTargetId === actorId && context.dayCount > 1) {
      return false;
    }
  }

  if (healTargetId) {
    gameData.witchHealUsed = true;
    gameData.nightActions!['WITCH_HEAL'] = { actorId, targetId: healTargetId };
  }
  if (poisonTargetId) {
    const target = context.players.find(p => p.id === poisonTargetId);
    if (!target || !target.isAlive) return false;
    gameData.witchPoisonUsed = true;
    gameData.nightActions!['WITCH_POISON'] = { actorId, targetId: poisonTargetId };
  }

  // Phù thủy xong, chuyển sang role tiếp theo
  gameData.currentNightRoleIndex!++;
  promptNextNightRole(roomId, io);
  return true;
};

/**
 * Xử lý kết quả ban đêm
 */
export const resolveNight = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const { nightActions } = gameData;
  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;

  const killedId = nightActions!['WEREWOLF']?.targetId;
  const protectedId = nightActions!['BODYGUARD']?.targetId;
  const healTargetId = nightActions!['WITCH_HEAL']?.targetId;
  const poisonTargetId = nightActions!['WITCH_POISON']?.targetId;

  // Cập nhật lastProtectedId
  gameData.lastProtectedId = protectedId || null;

  const nightDeaths: Player[] = [];

  // Nếu có người bị cắn và người đó không được bảo vệ (bởi Bảo vệ hoặc Phù thủy hồi sinh)
  if (killedId && killedId !== protectedId && killedId !== healTargetId) {
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

  // Phù thủy đầu độc
  if (poisonTargetId) {
    const poisonVictim = context.players.find(p => p.id === poisonTargetId);
    if (poisonVictim && poisonVictim.isAlive) {
      // Không được trùng với người đã chết bởi sói
      const alreadyDead = nightDeaths.some(d => d.id === poisonTargetId);
      if (!alreadyDead) {
        nightDeaths.push({
          id: poisonVictim.id,
          name: poisonVictim.name,
          role: poisonVictim.role,
          isAlive: false
        });
      }
    }
  }

  // Xử lý Tiên tri soi bài
  if (nightActions!['SEER']) {
    const seerAction = nightActions!['SEER'];
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
      if (!gameData.seerVisions[seerPlayer.id].some(v => v.targetId === targetPlayer.id)) {
        gameData.seerVisions[seerPlayer.id].push({
          targetId: targetPlayer.id,
          targetName: targetPlayer.name,
          isWerewolf
        });
      }
    }
  }

  // Gửi kết quả về Machine để chuyển trạng thái game
  gameData.actor.send({
    type: 'ALL_NIGHT_ACTIONS_DONE',
    nightDeaths
  });
};
