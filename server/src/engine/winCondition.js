import { FACTIONS, ROLES } from '../roles/index.js';

/**
 * Kiểm tra xem game đã kết thúc chưa và phe nào thắng.
 * @param {Array} players Danh sách người chơi hiện tại { id, role, isAlive }
 * @returns {Object} { isGameOver: boolean, winner: string|null }
 */
export const checkWinCondition = (players) => {
  const alivePlayers = players.filter(p => p.isAlive);
  
  let aliveWolves = 0;
  let aliveVillagers = 0;
  
  for (const player of alivePlayers) {
    const roleData = ROLES[player.role];
    if (!roleData) continue;
    
    if (roleData.faction === FACTIONS.WEREWOLF) {
      aliveWolves++;
    } else if (roleData.faction === FACTIONS.VILLAGER) {
      aliveVillagers++;
    }
  }
  
  // Sói thắng nếu số Sói >= số Dân (hoặc các phe khác)
  if (aliveWolves >= aliveVillagers) {
    return { isGameOver: true, winner: FACTIONS.WEREWOLF };
  }
  
  // Dân thắng nếu không còn Sói nào
  if (aliveWolves === 0) {
    return { isGameOver: true, winner: FACTIONS.VILLAGER };
  }
  
  return { isGameOver: false, winner: null };
};
