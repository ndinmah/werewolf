import type { GameContext, Player } from '../../types/game.ts';
import type { GameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';

class HunterHandler implements RoleHandler {
  onDeath(_roomId: string, deadPlayer: Player, context: GameContext, _gameData: GameData, _cause: string): void {
    if (deadPlayer.role === 'HUNTER') {
      // Mark that hunter needs retaliation
      context.pendingRetaliation = true;
    }
  }
}

RoleRegistry.register('HUNTER', new HunterHandler());
