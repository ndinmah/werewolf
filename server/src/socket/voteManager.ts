import { getGameData } from '../engine/gameStateManager.ts';

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
  if (!gameData) return { tally: {}, totalVoters: 0 };

  const snapshot = gameData.actor.getSnapshot();
  const alivePlayers = snapshot.context.players.filter(p => p.isAlive).length;
  
  const tally: Record<string, number> = {};
  for (const targetId of Object.values(gameData.votes) as string[]) {
    tally[targetId] = (tally[targetId] || 0) + 1;
  }

  return { tally, totalVoters: alivePlayers };
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
