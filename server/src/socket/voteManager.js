import { getGameData } from '../engine/gameStateManager.js';

export const castVote = (roomId, voterId, targetId) => {
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

export const getVoteTally = (roomId) => {
  const gameData = getGameData(roomId);
  if (!gameData) return { tally: {}, totalVoters: 0 };

  const snapshot = gameData.actor.getSnapshot();
  const alivePlayers = snapshot.context.players.filter(p => p.isAlive).length;
  
  const tally = {};
  for (const targetId of Object.values(gameData.votes)) {
    tally[targetId] = (tally[targetId] || 0) + 1;
  }

  return { tally, totalVoters: alivePlayers };
};

export const resolveVote = (roomId) => {
  const { tally } = getVoteTally(roomId);
  const gameData = getGameData(roomId);
  
  let maxVotes = 0;
  let targetToEliminate = null;
  let isTie = false;

  for (const [targetId, votes] of Object.entries(tally)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      targetToEliminate = targetId;
      isTie = false;
    } else if (votes === maxVotes) {
      isTie = true;
    }
  }

  // Xóa cache vote
  if (gameData) {
    gameData.votes = {};
  }

  if (isTie || maxVotes === 0) {
    return null; // Hòa phiếu hoặc không ai bầu
  }
  
  return targetToEliminate;
};
