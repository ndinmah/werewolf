import type { GameContext, Player, NightActionRecord } from '../../types/game.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';

class HunterHandler implements RoleHandler {
  onDeath(_roomId: string, deadPlayer: Player, context: GameContext, cause: string, nightActions?: NightActionRecord): Partial<GameContext> | void {
    if (deadPlayer.role === 'HUNTER' && !context.villagersLostPowers) {
      if (cause === 'night' && nightActions && nightActions['WITCH_POISON']?.targetId === deadPlayer.id) {
        return; // Bị độc chết, tước quyền nhả đạn
      }
      
      // Đánh dấu Thợ Săn cần trả đũa (không mutate context trực tiếp)
      return {
        pendingRetaliation: true,
        pendingRetaliationHunterId: deadPlayer.id,
      };
    }
  }
}

RoleRegistry.register('HUNTER', new HunterHandler());
