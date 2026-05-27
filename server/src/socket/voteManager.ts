import { getGameData } from '../engine/gameStateManager.ts';
import type { Server } from 'socket.io';
import type { SlimPlayer } from '../types/game.ts';

export const castVote = (roomId: string, voterId: string, targetId: string) => {
  const gameData = getGameData(roomId);
  if (!gameData) return false;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  
  // Kiểm tra xem có đang ở Phase thích hợp để vote (DayPhase hoặc VotingPhase tùy rule)
  if (snapshot.value !== 'VotingPhase') return false;
  
  const voter = context.players.find(p => p.id === voterId);
  const target = context.players.find(p => p.id === targetId);

  if (!voter || !voter.isAlive) return false;
  if (!target || !target.isAlive) return false;

  gameData.votes[voterId] = targetId;
  return true;
};

export const getVoteTally = (roomId: string) => {
  const gameData = getGameData(roomId);
  if (!gameData) return { tally: {}, totalVoters: 0, votersMap: {} };

  const snapshot = gameData.actor.getSnapshot();
  const players = snapshot.context.players;
  const alivePlayers = players.filter(p => p.isAlive).length;
  
  const tally: Record<string, number> = {};
  const votersMap: Record<string, { id: string; name: string }[]> = {};

  for (const [voterId, targetId] of Object.entries(gameData.votes)) {
    tally[targetId] = (tally[targetId] || 0) + 1;
    
    const voter = players.find(p => p.id === voterId);
    if (voter) {
      if (!votersMap[targetId]) {
        votersMap[targetId] = [];
      }
      votersMap[targetId].push({ id: voter.id, name: voter.name });
    }
  }

  return { tally, totalVoters: alivePlayers, votersMap };
};

export const resolveVote = (roomId: string): { eliminatedId: string | null; isTie: boolean } => {
  const { tally } = getVoteTally(roomId);
  const gameData = getGameData(roomId);
  
  let maxVotes = 0;
  let targetToEliminate: string | null = null;
  let isTie = false;

  for (const [targetId, votes] of Object.entries(tally)) {
    const v = votes as number;
    if (v > maxVotes) {
      maxVotes = v;
      targetToEliminate = targetId;
      isTie = false;
    } else if (v === maxVotes) {
      isTie = true;
    }
  }

  // Xóa cache vote
  if (gameData) {
    gameData.votes = {};
  }

  if (isTie) {
    return { eliminatedId: null, isTie: true };
  }

  if (maxVotes === 0) {
    return { eliminatedId: null, isTie: false };
  }
  
  return { eliminatedId: targetToEliminate, isTie: false };
};

/**
 * Hoàn thành quá trình biểu quyết: tính toán kết quả, gửi sự kiện và chuyển phase máy trạng thái
 * (Giải quyết trùng lặp D4)
 */
export const finalizeVoting = (roomId: string, io: Server): void => {
  const gameData = getGameData(roomId);
  if (!gameData) return;

  const { eliminatedId, isTie } = resolveVote(roomId);
  const context = gameData.actor.getSnapshot().context;

  let eliminatedPlayer: SlimPlayer | null = null;
  if (eliminatedId) {
    const p = context.players.find((x) => x.id === eliminatedId);
    if (p) {
      eliminatedPlayer = { id: p.id, name: p.name, role: p.role };
    }
  }

  // Gửi kết quả biểu quyết đến toàn bộ người chơi trong phòng
  io.to(roomId).emit('VOTING_RESULT', {
    eliminated: eliminatedPlayer,
    isTie,
  });

  // Chờ 4 giây trước khi chuyển phase để client hiển thị kết quả
  setTimeout(() => {
    gameData.actor.send({
      type: 'VOTING_DONE',
      eliminatedPlayer,
    });
  }, 4000);
};
