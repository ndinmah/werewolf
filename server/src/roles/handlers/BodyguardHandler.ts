import type { Server, Socket } from 'socket.io';
import type { GameContext, Player, NightActionPayload } from '../../types/game.ts';
import type { GameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';

class BodyguardHandler implements RoleHandler {
  promptNightAction(roomId: string, player: Player, context: GameContext, gameData: GameData, socket: Socket): void {
    const hasPowers = !context.villagersLostPowers;
    const alivePlayers = hasPowers ? context.players.filter((p) => p.isAlive) : [];
    socket.emit('NIGHT_ACTION_PROMPT', {
      role: 'BODYGUARD',
      targetablePlayers: alivePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        isAlive: p.isAlive,
      })),
      excludeTargetId: gameData.lastProtectedId || null,
    });
  }

  submitNightAction(
    roomId: string,
    player: Player,
    payload: NightActionPayload,
    context: GameContext,
    gameData: GameData,
    _io: Server,
  ): boolean {
    if (context.villagersLostPowers) {
      gameData.nightActionSubmitted?.add(player.id);
      return true;
    }
    if (payload.role !== 'BODYGUARD') return false;
    const targetId = payload.targetId;
    if (!targetId) return false;
    if (gameData.nightActionSubmitted.has(player.id)) return false;

    // Kiểm tra bảo vệ liên tiếp (không được bảo vệ cùng một người 2 đêm liên tiếp)
    if (targetId === gameData.lastProtectedId) return false;

    const targetPlayer = context.players.find((p) => p.id === targetId);
    if (!targetPlayer || !targetPlayer.isAlive) return false;

    gameData.nightActionSubmitted.add(player.id);
    if (!gameData.nightActions) gameData.nightActions = {};
    gameData.nightActions['BODYGUARD'] = { actorId: player.id, targetId };

    return true;
  }

  resolveNight(roomId: string, context: GameContext, gameData: GameData, deaths: Set<string>, _io: Server): void {
    const protectedId = gameData.nightActions?.['BODYGUARD']?.targetId;
    if (protectedId) {
      gameData.lastProtectedId = protectedId;
      if (deaths.has(protectedId)) {
        deaths.delete(protectedId);
      }
    } else {
      gameData.lastProtectedId = null;
    }
  }
}

RoleRegistry.register('BODYGUARD', new BodyguardHandler());
