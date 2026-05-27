import type { Server, Socket } from 'socket.io';
import type { GameContext, Player, NightActionPayload } from '../../types/game.ts';
import type { GameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';

class SeerHandler implements RoleHandler {
  promptNightAction(roomId: string, player: Player, context: GameContext, gameData: GameData, socket: Socket): void {
    const alivePlayers = context.players.filter(p => p.isAlive);
    socket.emit('NIGHT_ACTION_PROMPT', {
      role: 'SEER',
      targetablePlayers: alivePlayers.map(p => ({
        id: p.id,
        name: p.name,
        isAlive: p.isAlive
      })),
      excludeTargetId: null
    });
  }

  submitNightAction(
    roomId: string,
    player: Player,
    payload: NightActionPayload,
    context: GameContext,
    gameData: GameData,
    io: Server
  ): boolean {
    if (payload.role !== 'SEER') return false;
    const targetId = payload.targetId;
    if (!targetId) return false;
    if (gameData.nightActionSubmitted.has(player.id)) return false;

    const targetPlayer = context.players.find(p => p.id === targetId);
    if (!targetPlayer || !targetPlayer.isAlive) return false;

    gameData.nightActionSubmitted.add(player.id);
    if (!gameData.nightActions) gameData.nightActions = {};
    gameData.nightActions['SEER'] = { actorId: player.id, targetId };

    const isWerewolf = targetPlayer.role === 'WEREWOLF';
    const socket = io.sockets.sockets.get(player.id);
    if (socket) {
      socket.emit('SEER_RESULT', {
        targetId: targetPlayer.id,
        targetName: targetPlayer.name,
        isWerewolf
      });
    }

    if (!gameData.seerVisions) gameData.seerVisions = {};
    if (!gameData.seerVisions[player.id]) gameData.seerVisions[player.id] = [];
    if (!gameData.seerVisions[player.id].some(v => v.targetId === targetPlayer.id)) {
      gameData.seerVisions[player.id].push({
        targetId: targetPlayer.id,
        targetName: targetPlayer.name,
        isWerewolf
      });
    }

    return true;
  }
}

RoleRegistry.register('SEER', new SeerHandler());
