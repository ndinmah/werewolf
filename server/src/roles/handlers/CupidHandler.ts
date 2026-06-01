import type { Server } from 'socket.io';
import type { GameContext, Player, NightActionPayload } from '../../types/game.ts';
import type { GameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';
import { advanceFirstNightRole } from '../../socket/nightManager.ts';
import { getGameData } from '../../engine/gameStateManager.ts';

class CupidHandler implements RoleHandler {
  onFirstNightStart(roomId: string, context: GameContext, gameData: GameData, io: Server): void {
    const alivePlayers = context.players.filter(p => p.isAlive);
    const cupid = alivePlayers.find(p => p.role === 'CUPID');
    
    if (cupid) {
      const socket = io.sockets.sockets.get(cupid.id);
      if (socket) {
        socket.emit('NIGHT_ACTION_PROMPT', {
          role: 'CUPID',
          targetablePlayers: alivePlayers.map(p => ({
            id: p.id,
            name: p.name,
            isAlive: p.isAlive
          })),
        });
      }
      io.to(roomId).emit('NIGHT_STATUS_UPDATE', { currentRoleName: 'Cupid' });
      
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

  promptNightAction(_roomId: string, player: Player, context: GameContext, _gameData: GameData, socket: import('socket.io').Socket): void {
    const alivePlayers = context.players.filter(p => p.isAlive);
    socket.emit('NIGHT_ACTION_PROMPT', {
      role: 'CUPID',
      targetablePlayers: alivePlayers.map(p => ({
        id: p.id,
        name: p.name,
        isAlive: p.isAlive
      })),
    });
  }

  submitNightAction(
    roomId: string,
    player: Player,
    payload: NightActionPayload,
    context: GameContext,
    gameData: GameData,
    io: Server,
  ): boolean {
    // Chỉ xảy ra vào Đêm đầu tiên đối với Cupid
    if (gameData.actor.getSnapshot().value !== 'FirstNightPhase') return false;
    if (payload.role !== 'CUPID') return false;
    
    const lover1Id = payload.lover1Id;
    const lover2Id = payload.lover2Id;
    
    if (!lover1Id || !lover2Id) return false;

    const lover1 = context.players.find(p => p.id === lover1Id);
    const lover2 = context.players.find(p => p.id === lover2Id);
    if (!lover1 || !lover2 || !lover1.isAlive || !lover2.isAlive || lover1Id === lover2Id) {
      return false;
    }

    if (gameData.nightActionSubmitted.has(player.id)) return false;
    gameData.nightActionSubmitted.add(player.id);

    // Gửi sự kiện SET_LOVERS để cập nhật context thông qua máy trạng thái (không mutate trực tiếp)
    gameData.actor.send({
      type: 'SET_LOVERS',
      lover1Id,
      lover2Id
    });

    io.to(roomId).emit('NIGHT_STATUS_UPDATE', { currentRoleName: 'Người tình nhận diện' });

    const loverIds = [lover1Id, lover2Id];
    loverIds.forEach(id => {
      const socket = io.sockets.sockets.get(id);
      if (socket) {
        const partnerId = loverIds.find(x => x !== id);
        const partner = context.players.find(p => p.id === partnerId);
        socket.emit('FIRST_NIGHT_LOVERS_REVEAL', {
          partner: partner ? { id: partner.id, name: partner.name } : null
        });
      }
    });

    return true; // nightManager.ts (submitCupidAction) sẽ lo việc delay và chuyển tiếp role
  }
}

RoleRegistry.register('CUPID', new CupidHandler());
