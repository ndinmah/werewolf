import type { Server } from 'socket.io';
import type { GameContext, Player } from '../../types/game.ts';
import type { GameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';
import { ROLES } from '../index.ts';

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
      
      // Fallback timeout
      setTimeout(() => {
        // Will need to extract fallback logic, for now emit a internal event or call next step
        const globalWithGameData = global as typeof globalThis & { getGameData?: (roomId: string) => GameData | null };
        const currentGameData = globalWithGameData.getGameData ? globalWithGameData.getGameData(roomId) : null;
        if (currentGameData && currentGameData.actor.getSnapshot().value === 'FirstNightPhase') {
          // If cupid doesn't act, we move to wolves.
          const werewolfHandler = RoleRegistry.getHandler('WEREWOLF');
          if (werewolfHandler && werewolfHandler.onFirstNightStart) {
            werewolfHandler.onFirstNightStart(roomId, context, currentGameData, io);
          }
        }
      }, 30000);
    }
  }

  submitNightAction(
    roomId: string,
    player: Player,
    targetId: string | null,
    context: GameContext,
    gameData: GameData,
    io: Server,
    extraData?: unknown
  ): boolean {
    // Only happens in First Night for Cupid
    if (gameData.actor.getSnapshot().value !== 'FirstNightPhase') return false;
    
    const lover1Id = targetId;
    const lover2Id = (extraData as Record<string, string> | undefined)?.lover2Id; // We need to pass lover2Id from nightManager
    
    if (!lover1Id || !lover2Id) return false;

    const lover1 = context.players.find(p => p.id === lover1Id);
    const lover2 = context.players.find(p => p.id === lover2Id);
    if (!lover1 || !lover2 || !lover1.isAlive || !lover2.isAlive || lover1Id === lover2Id) {
      return false;
    }

    if (gameData.nightActionSubmitted.has(player.id)) return false;
    gameData.nightActionSubmitted.add(player.id);

    context.lovers = [lover1Id, lover2Id];

    const role1 = lover1.role ? ROLES[lover1.role as keyof typeof ROLES] : null;
    const role2 = lover2.role ? ROLES[lover2.role as keyof typeof ROLES] : null;
    if (role1 && role2 && role1.faction !== role2.faction) {
      lover1.faction = 'THIRD_PARTY';
      lover2.faction = 'THIRD_PARTY';
    }

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

    // Sau 5s chuyển cho Sói
    setTimeout(() => {
      const werewolfHandler = RoleRegistry.getHandler('WEREWOLF');
      if (werewolfHandler && werewolfHandler.onFirstNightStart) {
        werewolfHandler.onFirstNightStart(roomId, context, gameData, io);
      }
    }, 5000);

    return true; // action handled, do not auto-advance in nightManager (we handle async advance here)
  }
}

RoleRegistry.register('CUPID', new CupidHandler());
