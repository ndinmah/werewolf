import type { Server, Socket } from 'socket.io';
import type { GameContext, Player } from '../../types/game.ts';
import type { GameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';

class WitchHandler implements RoleHandler {
  promptNightAction(_roomId: string, player: Player, context: GameContext, gameData: GameData, socket: Socket): void {
    const alivePlayers = context.players.filter((p) => p.isAlive);
    const werewolfTarget = gameData.nightActions?.['WEREWOLF']?.targetId || null;
    const isSelfBitten = werewolfTarget === player.id;
    const canHeal = !gameData.witchHealUsed && (!isSelfBitten || context.dayCount === 1);

    socket.emit('NIGHT_ACTION_PROMPT', {
      role: 'WITCH',
      targetablePlayers: alivePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        isAlive: p.isAlive,
      })),
      excludeTargetId: null,
      witchInfo: {
        werewolfVictimId: werewolfTarget,
        canHeal,
        canPoison: !gameData.witchPoisonUsed,
      },
    });
  }

  submitNightAction(
    _roomId: string,
    player: Player,
    targetId: string | null,
    context: GameContext,
    gameData: GameData,
    _io: Server,
    extraData?: unknown,
  ): boolean {
    const healTargetId = targetId; // by convention from previous code, or we can use extraData
    const poisonTargetId = (extraData as Record<string, string> | undefined)?.poisonTargetId || null;

    if (gameData.nightActionSubmitted.has(player.id)) return false;

    // Validate
    if (healTargetId && gameData.witchHealUsed) return false;
    if (poisonTargetId && gameData.witchPoisonUsed) return false;

    if (healTargetId) {
      const werewolfTarget = gameData.nightActions?.['WEREWOLF']?.targetId || null;
      if (healTargetId !== werewolfTarget) return false;
      if (healTargetId === player.id && context.dayCount > 1) return false;
    }

    gameData.nightActionSubmitted.add(player.id);
    if (!gameData.nightActions) gameData.nightActions = {};

    if (healTargetId) {
      gameData.witchHealUsed = true;
      gameData.nightActions['WITCH_HEAL'] = { actorId: player.id, targetId: healTargetId };
    }
    if (poisonTargetId) {
      const target = context.players.find((p) => p.id === poisonTargetId);
      if (!target || !target.isAlive) return false;
      gameData.witchPoisonUsed = true;
      gameData.nightActions['WITCH_POISON'] = { actorId: player.id, targetId: poisonTargetId };
    }

    return true;
  }

  resolveNight(_roomId: string, _context: GameContext, gameData: GameData, deaths: Set<string>, _io: Server): void {
    const healTargetId = gameData.nightActions?.['WITCH_HEAL']?.targetId;
    const poisonTargetId = gameData.nightActions?.['WITCH_POISON']?.targetId;

    if (healTargetId && deaths.has(healTargetId)) {
      deaths.delete(healTargetId);
    }
    if (poisonTargetId) {
      deaths.add(poisonTargetId);
    }
  }
}

RoleRegistry.register('WITCH', new WitchHandler());
