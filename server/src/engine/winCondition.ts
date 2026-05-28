import { FACTIONS } from '../roles/index.ts';
import type { Player, Faction, SlimPlayer } from '../types/game.ts';

/**
 * Kiểm tra xem game đã kết thúc chưa và phe nào thắng.
 * @param {Array} players Danh sách người chơi hiện tại { id, role, isAlive }
 * @param {SlimPlayer | null} dayDeath Người chơi bị treo cổ hôm nay (nếu có)
 * @param {string[]} lovers Danh sách ID của cặp tình nhân
 * @returns {Object} { isGameOver: boolean, winner: string|null }
 */
export const checkWinCondition = (
  players: Player[],
  dayDeath?: SlimPlayer | null,
  lovers?: string[]
): { isGameOver: boolean; winner: Faction | null } => {
  // Nếu Tanner bị vote treo cổ vào ban ngày, Tanner thắng lập tức
  if (dayDeath && dayDeath.role === 'TANNER') {
    return { isGameOver: true, winner: FACTIONS.THIRD_PARTY as Faction };
  }

  const alivePlayers = players.filter((p) => p.isAlive);

  let aliveWolves = 0;

  for (const player of alivePlayers) {
    if (player.faction === FACTIONS.WEREWOLF) {
      aliveWolves++;
    }
  }

  // Kiểm tra xem cặp tình nhân khác phe (Phe Thứ Ba / Phe Cặp Đôi) có còn sống đầy đủ hay không
  const isDifferentFactionLoverCoupleAlive = 
    lovers && 
    lovers.length === 2 && 
    lovers.every(id => {
      const p = players.find(x => x.id === id);
      return p && p.isAlive && p.faction === FACTIONS.THIRD_PARTY;
    });

  // 1. Phe thứ 3 (Người tình khác phe) thắng nếu họ là 2 người duy nhất còn sống sót
  const thirdPartyWin = isDifferentFactionLoverCoupleAlive && alivePlayers.length === 2;

  // 2. Sói thắng khi số lượng Sói >= số lượng các người chơi còn lại
  const wolvesWin = aliveWolves >= alivePlayers.length - aliveWolves;

  // 3. Dân thắng khi toàn bộ Sói và Phe Thứ 3 đều đã chết
  const villagersWin = aliveWolves === 0 && !isDifferentFactionLoverCoupleAlive;

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
