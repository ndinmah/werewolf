import { FACTIONS, ROLES } from '../roles/index.ts';

/**
 * Kiá»ƒm tra xem game Ä‘Ã£ káº¿t thÃºc chÆ°a vÃ  phe nÃ o tháº¯ng.
 * @param {Array} players Danh sÃ¡ch ngÆ°á»i chÆ¡i hiá»‡n táº¡i { id, role, isAlive }
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
  
  // SÃ³i tháº¯ng náº¿u sá»‘ SÃ³i >= sá»‘ DÃ¢n
  const wolvesWin = aliveWolves >= aliveVillagers;
  // DÃ¢n tháº¯ng náº¿u khÃ´ng cÃ²n SÃ³i nÃ o
  const villagersWin = aliveWolves === 0;
  
  if (wolvesWin || villagersWin) {
    // Kiá»ƒm tra xem cÃ³ ngÆ°á»i chÆ¡i phe thá»© 3 nÃ o cÃ²n sá»‘ng khÃ´ng
    const aliveThirdParty = alivePlayers.some(p => {
      const roleData = ROLES[p.role];
      return roleData && roleData.faction === FACTIONS.THIRD_PARTY;
    });
    
    if (aliveThirdParty) {
      return { isGameOver: true, winner: FACTIONS.THIRD_PARTY };
    }
    
    return { isGameOver: true, winner: wolvesWin ? FACTIONS.WEREWOLF : FACTIONS.VILLAGER };
  }
  
  return { isGameOver: false, winner: null };
};
