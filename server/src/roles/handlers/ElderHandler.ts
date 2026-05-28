import type { GameContext, Player } from '../../types/game.ts';
import { getGameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';

class ElderHandler implements RoleHandler {
  onDeath(roomId: string, deadPlayer: Player, context: GameContext, cause: string): Partial<GameContext> | void {
    if (deadPlayer.role !== 'ELDER') return;

    // Use roomId if passed, otherwise fallback to context.roomId
    const actualRoomId = roomId || context.roomId;
    if (!actualRoomId) return;

    const gameData = getGameData(actualRoomId);
    const wasPoisonedByWitch =
      !!gameData?.nightActions?.['WITCH_POISON']?.targetId &&
      gameData.nightActions['WITCH_POISON'].targetId === deadPlayer.id;

    // Lời nguyền của Già làng kích hoạt nếu chết do:
    // 1. Biểu quyết treo cổ (cause === 'vote')
    // 2. Thợ săn bắn trả (cause === 'hunter')
    // 3. Phù thủy đầu độc ban đêm (wasPoisonedByWitch)
    if (cause === 'vote' || cause === 'hunter' || wasPoisonedByWitch) {
      return {
        villagersLostPowers: true,
      };
    }
  }
}

RoleRegistry.register('ELDER', new ElderHandler());
