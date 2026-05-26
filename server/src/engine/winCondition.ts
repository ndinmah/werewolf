import { FACTIONS, ROLES } from '../roles/index.ts';
import type { Player, Faction } from '../types/game.ts';

/**
 * Kiểm tra xem game đã kết thúc chưa và phe nào thắng.
 * @param {Array} players Danh sách người chơi hiện tại { id, role, isAlive }
 * @returns {Object} { isGameOver: boolean, winner: string|null }
 */
export const checkWinCondition = (players: Player[]): { isGameOver: boolean; winner: Faction | null } => {
  const alivePlayers = players.filter(p => p.isAlive);
  
  let aliveWolves = 0;
  let aliveVillagers = 0;
  
  for (const player of alivePlayers) {
    const roleData = player.role ? ROLES[player.role as keyof typeof ROLES] : null;
    if (!roleData) continue;
    
    if (roleData.faction === FACTIONS.WEREWOLF) {
      aliveWolves++;
    } else if (roleData.faction === FACTIONS.VILLAGER) {
      aliveVillagers++;
    }
  }
  
  // Sói thắng nếu số Sói >= số Dân
  const wolvesWin = aliveWolves >= aliveVillagers;
  // Dân thắng nếu không còn Sói nào
  const villagersWin = aliveWolves === 0;
  
  if (wolvesWin || villagersWin) {
    // Kiểm tra xem có người chơi phe thứ 3 nào còn sống không
    const aliveThirdParty = alivePlayers.some(p => {
      const roleData = p.role ? ROLES[p.role as keyof typeof ROLES] : null;
      return roleData && roleData.faction === FACTIONS.THIRD_PARTY;
    });
    
    if (aliveThirdParty) {
      return { isGameOver: true, winner: FACTIONS.THIRD_PARTY as Faction };
    }
    
    return { isGameOver: true, winner: (wolvesWin ? FACTIONS.WEREWOLF : FACTIONS.VILLAGER) as Faction };
  }
  
  return { isGameOver: false, winner: null };
};
