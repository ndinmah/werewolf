import type { GameContext, Player, NightActionRecord } from '../../types/game.ts';
import { getGameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';

class ElderHandler implements RoleHandler {
  onDeath(roomId: string, deadPlayer: Player, context: GameContext, cause: string, nightActions?: NightActionRecord): Partial<GameContext> | void {
    if (deadPlayer.role !== 'ELDER') return;

    // Sử dụng nightActions được truyền vào từ triggerDeathHooks (safe từ race condition)
    // Nếu không có (ví dụ bị vote chết ban ngày), fallback gọi getGameData (mặc dù ban ngày thì poison cũng đã clear)
    let actions = nightActions;
    if (!actions) {
      const actualRoomId = roomId || context.roomId;
      if (actualRoomId) {
        const gameData = getGameData(actualRoomId);
        actions = gameData?.nightActions;
      }
    }

    const wasPoisonedByWitch =
      !!actions?.['WITCH_POISON']?.targetId &&
      actions['WITCH_POISON'].targetId === deadPlayer.id;

    const wasVoted = cause === 'vote' && context.dayDeath?.id === deadPlayer.id;
    const wasShot = cause === 'hunter' && context.hunterShotPlayer?.id === deadPlayer.id;

    // Lời nguyền của Già làng kích hoạt nếu chết trực tiếp do:
    // 1. Biểu quyết treo cổ (wasVoted)
    // 2. Thợ săn bắn trả (wasShot)
    // 3. Phù thủy đầu độc ban đêm (wasPoisonedByWitch)
    if (wasVoted || wasShot || wasPoisonedByWitch) {
      return {
        villagersLostPowers: true,
      };
    }
  }
}

RoleRegistry.register('ELDER', new ElderHandler());
