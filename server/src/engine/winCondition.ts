import { FACTIONS } from '../roles/index.ts';
import type { Player, Faction } from '../types/game.ts';

/**
 * Kiểm tra xem game đã kết thúc chưa và phe nào thắng.
 * @param {Array} players Danh sách người chơi hiện tại { id, role, isAlive }
 * @returns {Object} { isGameOver: boolean, winner: string|null }
 */
export const checkWinCondition = (
  players: Player[]
): { isGameOver: boolean; winner: Faction | null } => {
  const alivePlayers = players.filter(p => p.isAlive);
  
  let aliveWolves = 0;
  let aliveThirdParty = 0;
  
  for (const player of alivePlayers) {
    if (player.faction === FACTIONS.WEREWOLF) {
      aliveWolves++;
    } else if (player.faction === FACTIONS.THIRD_PARTY) {
      aliveThirdParty++;
    }
  }
  
  // 1. Phe thứ 3 (Người tình khác phe) thắng nếu họ là 2 người duy nhất còn sống sót
  const thirdPartyWin = aliveThirdParty === 2 && alivePlayers.length === 2;

  // 2. Sói thắng khi số lượng Sói >= số lượng các người chơi còn lại
  const wolvesWin = aliveWolves >= (alivePlayers.length - aliveWolves);

  // 3. Dân thắng khi toàn bộ Sói và Phe Thứ 3 đều đã chết
  const villagersWin = aliveWolves === 0 && aliveThirdParty === 0;

  if (thirdPartyWin) {
    return { isGameOver: true, winner: FACTIONS.THIRD_PARTY as Faction };
  }
  
  if (wolvesWin) {
    return { isGameOver: true, winner: FACTIONS.WEREWOLF as Faction };
  }
  
  if (villagersWin) {
    return { isGameOver: true, winner: FACTIONS.VILLAGER as Faction };
  }
  
  return { isGameOver: false, winner: null };
};
