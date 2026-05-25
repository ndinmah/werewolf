import { createActor, assign } from 'xstate';
import { gameMachine } from './gameMachine.ts';

// Map lÆ°u trá»¯: roomId -> { machine, actor, chatLogs, votes, disconnectTimers, phaseTimer, lastProtectedId, seerVisions }
const gameRooms = new Map();

export const createGameActor = (roomId, io) => {
  if (gameRooms.has(roomId)) {
    return gameRooms.get(roomId).actor;
  }

  // Cáº¥u hÃ¬nh cÃ¡c action cÃ³ tÆ°Æ¡ng tÃ¡c socket/timer thá»±c táº¿
  const machineWithActions = gameMachine.provide({
    actions: {
      notifyPlayers: ({ context }) => {
        if (io) {
          io.to(roomId).fetchSockets().then(sockets => {
            sockets.forEach(s => {
              const myPlayer = context.players.find(p => p.id === s.id);

              const personalizedPlayers = context.players.map(p => {
                const isSelf = p.id === s.id;
                const isDead = !p.isAlive;
                const isWolfTeam = myPlayer?.role === 'WEREWOLF' && p.role === 'WEREWOLF';
                const isGameOver = context.phase === 'gameOver';

                // Chá»‰ hiá»ƒn thá»‹ role cá»§a báº£n thÃ¢n, ngÆ°á»i Ä‘Ã£ cháº¿t, Ä‘á»“ng bá»n sÃ³i hoáº·c khi káº¿t thÃºc game
                if (isSelf || isDead || isWolfTeam || isGameOver) {
                  return p;
                }
                return {
                  ...p,
                  role: undefined,
                  faction: undefined
                };
              });

              s.emit('GAME_STATE_UPDATE', {
                phase: context.phase,
                dayCount: context.dayCount,
                players: personalizedPlayers,
                nightDeaths: context.nightDeaths,
                dayDeath: context.dayDeath,
                winner: context.winner,
                timerDuration: context.timerDuration,
                timerStartAt: context.timerStartAt
              });
            });
          });
        }
      },
      runNightStart: () => {
        import('../socket/nightManager.ts').then(({ startNight }) => {
          startNight(roomId, io);
        });
      },
      startDayStartTimer: assign(({ context }) => {
        const duration = (context.settings?.dayStartDuration || 8) * 1000;
        setGameTimer(roomId, duration, () => {
          const actor = getGameActor(roomId);
          if (actor) actor.send({ type: 'TIMER_EXPIRED' });
        });
        return {
          timerDuration: duration,
          timerStartAt: Date.now()
        };
      }),
      startDayDiscussTimer: assign(({ context }) => {
        const duration = (context.settings?.discussionTime || 120) * 1000;
        setGameTimer(roomId, duration, () => {
          const actor = getGameActor(roomId);
          if (actor) actor.send({ type: 'TIMER_EXPIRED' });
        });
        return {
          timerDuration: duration,
          timerStartAt: Date.now()
        };
      }),
      startVotingTimer: assign(({ context }) => {
        const duration = (context.settings?.voteTime || 60) * 1000;
        setGameTimer(roomId, duration, () => {
          const actor = getGameActor(roomId);
          if (actor) actor.send({ type: 'TIMER_EXPIRED' });
        });
        return {
          timerDuration: duration,
          timerStartAt: Date.now()
        };
      }),
      runHunterRetaliationStart: assign(({ context }) => {
        const isNightDeath = context.hunterNextPhase === 'dayStart';
        const hunter = isNightDeath 
          ? context.nightDeaths.find(d => d.role === 'HUNTER')
          : (context.dayDeath?.role === 'HUNTER' ? context.dayDeath : null);

        const duration = 30 * 1000;
        setGameTimer(roomId, duration, () => {
          const actor = getGameActor(roomId);
          if (actor) actor.send({ type: 'TIMER_EXPIRED' });
        });

        if (hunter && io) {
          const socket = io.sockets.sockets.get(hunter.id);
          if (socket) {
            socket.emit('HUNTER_RETALIATION_PROMPT', {
              targetablePlayers: context.players.filter(p => p.isAlive && p.id !== hunter.id).map(p => ({
                id: p.id,
                name: p.name
              }))
            });
          }
        }

        return {
          timerDuration: duration,
          timerStartAt: Date.now()
        };
      }),
      startGameOverTimer: assign(({ context }) => {
        const duration = 10 * 1000;
        setGameTimer(roomId, duration, () => {
          import('../socket/roomManager.ts').then(({ getRoom, updateRoomStatus, getRooms }) => {
            const room = getRoom(roomId);
            if (room) {
              updateRoomStatus(roomId, 'Lobby');
              destroyGameActor(roomId);

              io.to(roomId).emit('ROOM_UPDATED', room);
              io.to(roomId).emit('GAME_RESET');
              io.emit('ROOM_LIST', getRooms());
            }
          });
        });
        return {
          timerDuration: duration,
          timerStartAt: Date.now()
        };
      }),
      autoResolveVotes: () => {
        import('../socket/voteManager.ts').then(({ resolveVote }) => {
          const gameData = gameRooms.get(roomId);
          if (!gameData) return;

          const eliminatedId = resolveVote(roomId);
          const context = gameData.actor.getSnapshot().context;

          let eliminatedPlayer: { id: string; name: string; role?: string } | null = null;
          if (eliminatedId) {
            const p = context.players.find(x => x.id === eliminatedId);
            if (p) {
              eliminatedPlayer = { id: p.id, name: p.name, role: p.role };
            }
          }

          // Emit káº¿t quáº£ vote vá» client
          io.to(roomId).emit('VOTING_RESULT', {
            eliminatedPlayer,
            isTie: !eliminatedId && Object.keys(gameData.votes).length > 0
          });

          // Chá» 4s hiá»ƒn thá»‹ káº¿t quáº£ rá»“i sang phase tiáº¿p theo
          setTimeout(() => {
            gameData.actor.send({
              type: 'VOTING_DONE',
              eliminatedPlayer
            });
          }, 4000);
        });
      }
    }
  });

  const actor = createActor(machineWithActions);
  actor.start();

  gameRooms.set(roomId, {
    machine: machineWithActions,
    actor: actor,
    chatLogs: {
      general: [],
      wolves: [],
      ghost: []
    },
    votes: {},
    disconnectTimers: {},
    phaseTimer: null,
    lastProtectedId: null,
    seerVisions: {}
  });

  return actor;
};

export const getGameActor = (roomId) => {
  const room = gameRooms.get(roomId);
  return room ? room.actor : null;
};

export const getGameData = (roomId) => {
  return gameRooms.get(roomId);
};

export const setGameTimer = (roomId, duration, callback) => {
  const room = gameRooms.get(roomId);
  if (room) {
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
    }
    room.phaseTimer = setTimeout(callback, duration);
  }
};

export const clearGameTimer = (roomId) => {
  const room = gameRooms.get(roomId);
  if (room && room.phaseTimer) {
    clearTimeout(room.phaseTimer);
    room.phaseTimer = null;
  }
};

export const destroyGameActor = (roomId) => {
  const room = gameRooms.get(roomId);
  if (room) {
    room.actor.stop();
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
    }
    for (const timer of Object.values(room.disconnectTimers)) {
      clearTimeout(timer as NodeJS.Timeout);
    }
    gameRooms.delete(roomId);
  }
};
