import type { GameContext, Player } from '../types/game.ts';

/**
 * Tìm kiếm người chơi là Thợ Săn đang có quyền trả đũa
 * (Giải quyết trùng lặp D1)
 */
export const findPendingHunter = (context: GameContext): Player | undefined => {
  let hunter = context.players.find(p => p.id === context.pendingRetaliationHunterId);
  
  if (!hunter) {
    const isNightDeath = context.hunterNextPhase === 'dayStart';
    const hunterTarget = isNightDeath
      ? context.nightDeaths.find(d => d.role === 'HUNTER')
      : (context.dayDeath?.role === 'HUNTER' ? context.dayDeath : null);
    if (hunterTarget) {
      hunter = context.players.find(p => p.id === hunterTarget.id);
    }
  }
  return hunter;
};

/**
 * Xử lý chết chùm của cặp đôi người tình
 * (Giải quyết trùng lặp D2)
 */
export const addLoverDeaths = (
  deadIds: Set<string>,
  lovers: string[],
  players: Player[],
  nightDeaths?: Player[]
): void => {
  if (lovers && lovers.length === 2) {
    const [l1, l2] = lovers;
    const l1Died = deadIds.has(l1);
    const l2Died = deadIds.has(l2);

    if (l1Died && !l2Died) {
      deadIds.add(l2);
      if (nightDeaths) {
        const partner = players.find(p => p.id === l2);
        if (partner && partner.isAlive && !nightDeaths.some(nd => nd.id === l2)) {
          nightDeaths.push({ ...partner, isAlive: false });
        }
      }
    } else if (l2Died && !l1Died) {
      deadIds.add(l1);
      if (nightDeaths) {
        const partner = players.find(p => p.id === l1);
        if (partner && partner.isAlive && !nightDeaths.some(nd => nd.id === l1)) {
          nightDeaths.push({ ...partner, isAlive: false });
        }
      }
    }
  }
};

/**
 * Lấy danh sách ID của các người chơi vừa mới tử vong
 * (Giải quyết trùng lặp D3)
 */
export const getNewlyDeadPlayerIds = (oldPlayers: Player[], newPlayers: Player[]): string[] => {
  const newlyDeadIds: string[] = [];
  newPlayers.forEach(p => {
    if (!p.isAlive) {
      const wasAlive = oldPlayers.some(oldP => oldP.id === p.id && oldP.isAlive);
      if (wasAlive) {
        newlyDeadIds.push(p.id);
      }
    }
  });
  return newlyDeadIds;
};
