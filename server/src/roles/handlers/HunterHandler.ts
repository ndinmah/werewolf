import type { GameContext, Player } from '../../types/game.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';

class HunterHandler implements RoleHandler {
  onDeath(_roomId: string, deadPlayer: Player, _context: GameContext, _cause: string): Partial<GameContext> | void {
    if (deadPlayer.role === 'HUNTER') {
      // Đánh dấu Thợ Săn cần trả đũa (không mutate context trực tiếp)
      return {
        pendingRetaliation: true,
        pendingRetaliationHunterId: deadPlayer.id,
      };
    }
  }
}

RoleRegistry.register('HUNTER', new HunterHandler());
