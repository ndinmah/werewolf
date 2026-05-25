import { getGameData } from '../engine/gameStateManager.ts';

export const castVote = (roomId, voterId, targetId) => {
  const gameData = getGameData(roomId);
  if (!gameData) return false;

  const snapshot = gameData.actor.getSnapshot();
  const context = snapshot.context;
  
  // Kiá»ƒm tra xem cÃ³ Ä‘ang á»Ÿ Phase thÃ­ch há»£p Ä‘á»ƒ vote (DayPhase hoáº·c VotingPhase tÃ¹y rule)
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
  
  const tally: Record<string, number> = {};
  for (const targetId of Object.values(gameData.votes) as string[]) {
    tally[targetId] = (tally[targetId] || 0) + 1;
  }

  return { tally, totalVoters: alivePlayers };
};

export const resolveVote = (roomId) => {
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

  // XÃ³a cache vote
  if (gameData) {
    gameData.votes = {};
  }

  if (isTie || maxVotes === 0) {
    return null; // HÃ²a phiáº¿u hoáº·c khÃ´ng ai báº§u
  }
  
  return targetToEliminate;
};
