import type { Server, Socket } from 'socket.io';
import type { GameContext, Player, NightActionPayload } from '../../types/game.ts';
import type { GameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';
import { advanceFirstNightRole } from '../../socket/nightManager.ts';

class WerewolfHandler implements RoleHandler {
  onFirstNightStart(roomId: string, context: GameContext, gameData: GameData, io: Server): void {
    const alivePlayers = context.players.filter(p => p.isAlive);
    const wolves = alivePlayers.filter(p => p.role === 'WEREWOLF');

    wolves.forEach(w => {
      const socket = io.sockets.sockets.get(w.id);
      if (socket) {
        const teammates = wolves.filter(wolf => wolf.id !== w.id).map(wolf => ({
          id: wolf.id,
          name: wolf.name
        }));
        socket.emit('FIRST_NIGHT_WOLF_REVEAL', { teammates });
      }
    });

    io.to(roomId).emit('NIGHT_STATUS_UPDATE', { currentRoleName: 'Ma Sói' });

    setTimeout(() => {
      if (gameData.actor.getSnapshot().value === 'FirstNightPhase') {
        advanceFirstNightRole(roomId, io);
      }
    }, 10000);
  }

  promptNightAction(_roomId: string, player: Player, context: GameContext, _gameData: GameData, socket: Socket): void {
    const alivePlayers = context.players.filter(p => p.isAlive);
    socket.emit('NIGHT_ACTION_PROMPT', {
      role: 'WEREWOLF',
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
    if (payload.role !== 'WEREWOLF') return false;
    const targetId = payload.targetId;
    if (!targetId) return false;

    if (gameData.nightActionSubmitted.has(player.id)) return false;
    gameData.nightActionSubmitted.add(player.id);

    const wolfVotes = gameData.wolfVotes || {};
    const wolfVoteTimes = gameData.wolfVoteTimes || {};
    wolfVotes[player.id] = targetId;
    wolfVoteTimes[player.id] = Date.now();
    gameData.wolfVotes = wolfVotes;
    gameData.wolfVoteTimes = wolfVoteTimes;

    const wolves = context.players.filter(p => p.role === 'WEREWOLF' && p.isAlive);
    const submittedWolfIds = wolves.map(w => w.id).filter(id => gameData.nightActionSubmitted.has(id));

    wolves.forEach(w => {
      const socket = io.sockets.sockets.get(w.id);
      if (socket) {
        socket.emit('WOLF_VOTE_UPDATED', {
          votes: wolfVotes,
          submitted: submittedWolfIds
        });
      }
    });

    const allWolvesSubmitted = wolves.every(w => gameData.nightActionSubmitted.has(w.id));
    if (allWolvesSubmitted) {
      computeWerewolfTarget(context, gameData);
    }

    return true;
  }

  resolveNight(roomId: string, context: GameContext, gameData: GameData, deaths: Set<string>, _io: Server): void {
    const killedId = gameData.nightActions?.['WEREWOLF']?.targetId;
    if (killedId) {
      deaths.add(killedId);
    }
  }
}

RoleRegistry.register('WEREWOLF', new WerewolfHandler());

export const computeWerewolfTarget = (context: GameContext, gameData: GameData): void => {
  const wolves = context.players.filter(p => p.role === 'WEREWOLF' && p.isAlive);
  const wolfVotes = gameData.wolfVotes || {};
  const wolfVoteTimes = gameData.wolfVoteTimes || {};

  const tally: Record<string, number> = {};
  wolves.forEach(w => {
    const tId = wolfVotes[w.id];
    if (tId) tally[tId] = (tally[tId] || 0) + 1;
  });

  let maxVotes = 0;
  let candidates: string[] = [];
  Object.entries(tally).forEach(([tId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      candidates = [tId];
    } else if (count === maxVotes) {
      candidates.push(tId);
    }
  });

  let finalTargetId: string | null = null;
  if (candidates.length === 1) {
    finalTargetId = candidates[0];
  } else if (candidates.length > 1) {
    let earliestTime = Infinity;
    candidates.forEach(tId => {
      const voters = wolves.filter(w => wolfVotes[w.id] === tId);
      voters.forEach(w => {
        const voteTime = wolfVoteTimes[w.id] || Infinity;
        if (voteTime < earliestTime) {
          earliestTime = voteTime;
          finalTargetId = tId;
        }
      });
    });
  }

  if (finalTargetId) {
    if (!gameData.nightActions) gameData.nightActions = {};
    gameData.nightActions['WEREWOLF'] = { actorId: 'WEREWOLF', targetId: finalTargetId };
  }
};
