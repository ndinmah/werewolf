import type { Server, Socket } from 'socket.io';
import type { GameContext, Player, NightActionPayload } from '../../types/game.ts';
import type { GameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';
import { advanceFirstNightRole } from '../../socket/nightManager.ts';
import { getGameData } from '../../engine/gameStateManager.ts';

class DoppelgangerHandler implements RoleHandler {
  onFirstNightStart(roomId: string, context: GameContext, gameData: GameData, io: Server): void {
    const alivePlayers = context.players.filter(p => p.isAlive);
    const doppelgangers = alivePlayers.filter(p => p.role === 'DOPPELGANGER');

    if (doppelgangers.length > 0) {
      doppelgangers.forEach(player => {
        const socket = io.sockets.sockets.get(player.id);
        if (socket) {
          const targetablePlayers = alivePlayers.filter(p => p.id !== player.id);
          socket.emit('NIGHT_ACTION_PROMPT', {
            role: 'DOPPELGANGER',
            targetablePlayers: targetablePlayers.map(p => ({
              id: p.id,
              name: p.name,
              isAlive: p.isAlive
            })),
            excludeTargetId: null
          });
        }
      });

      io.to(roomId).emit('NIGHT_STATUS_UPDATE', { currentRoleName: 'Kẻ nhân bản' });

      // Hạn giờ tự động chuyển tiếp (fallback timeout)
      const currentRoleIndex = gameData.currentNightRoleIndex;
      setTimeout(() => {
        const currentGameData = getGameData(roomId);
        if (
          currentGameData &&
          currentGameData.actor.getSnapshot().value === 'FirstNightPhase' &&
          currentGameData.currentNightRoleIndex === currentRoleIndex
        ) {
          advanceFirstNightRole(roomId, io);
        }
      }, 30000);
    }
  }

  promptNightAction(_roomId: string, player: Player, context: GameContext, _gameData: GameData, socket: Socket): void {
    // Kẻ nhân bản chọn 1 người chơi còn sống khác làm Bản gốc
    const targetablePlayers = context.players.filter((p) => p.isAlive && p.id !== player.id);
    socket.emit('NIGHT_ACTION_PROMPT', {
      role: 'DOPPELGANGER',
      targetablePlayers: targetablePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        isAlive: p.isAlive,
      })),
      excludeTargetId: null,
    });
  }

  submitNightAction(
    _roomId: string,
    player: Player,
    payload: NightActionPayload,
    context: GameContext,
    gameData: GameData,
    _io: Server,
  ): boolean {
    if (payload.role !== 'DOPPELGANGER') return false;
    const targetId = payload.targetId;
    if (!targetId) return false;
    if (gameData.nightActionSubmitted.has(player.id)) return false;

    const targetPlayer = context.players.find((p) => p.id === targetId);
    if (!targetPlayer || !targetPlayer.isAlive || targetPlayer.id === player.id) return false;

    gameData.nightActionSubmitted.add(player.id);
    if (!gameData.nightActions) gameData.nightActions = {};
    gameData.nightActions['DOPPELGANGER'] = { actorId: player.id, targetId };

    return true;
  }
}

RoleRegistry.register('DOPPELGANGER', new DoppelgangerHandler());
