import { setup, assign } from 'xstate';
import { checkWinCondition } from './winCondition.ts';
import { ROLES } from '../roles/index.ts';
import type { GameContext, GameEvent } from '../types/game.ts';

// Định nghĩa state machine cho một phòng game Ma Sói Ma Sói
export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent
  },
  actions: {
    notifyPlayers: () => {
      // Sẽ được inject từ bên ngoài ở gameStateManager.js
    },
    runNightStart: () => {
      // Sẽ được inject từ bên ngoài
    },
    startDayStartTimer: () => {
      // Sẽ được inject từ bên ngoài
    },
    startDayDiscussTimer: () => {
      // Sẽ được inject từ bên ngoài
    },
    startVotingTimer: () => {
      // Sẽ được inject từ bên ngoài
    },
    runHunterRetaliationStart: () => {
      // Sẽ được inject từ bên ngoài
    },
    startGameOverTimer: () => {
      // Sẽ được inject từ bên ngoài
    },
    autoResolveVotes: () => {
      // Sẽ được inject từ bên ngoài
    },
    setupGame: assign(({ context, event }) => {
      const playersList = event.players || context.players;
      const settings = event.settings || { roles: [] };

      // Cài đặt bộ bài (roles)
      let rolesToAssign = [...(settings.roles || [])];

      // Nếu thiếu bài, tự động bù thêm Dân làng (VILLAGER)
      while (rolesToAssign.length < playersList.length) {
        rolesToAssign.push('VILLAGER');
      }

      // Nếu dư bài, xáo và rút ngẫu nhiên bằng số người chơi
      if (rolesToAssign.length > playersList.length) {
        rolesToAssign = rolesToAssign.sort(() => Math.random() - 0.5).slice(0, playersList.length);
      }

      // Trộn bài ngẫu nhiên
      rolesToAssign = rolesToAssign.sort(() => Math.random() - 0.5);

      // Gán role cho từng người
      const assignedPlayers = playersList.map((p, idx) => {
        const roleId = rolesToAssign[idx];
        const roleData = ROLES[roleId] || ROLES.VILLAGER;
        return {
          ...p,
          role: roleId,
          faction: roleData.faction,
          isAlive: true,
          disconnected: false
        };
      });

      return {
        players: assignedPlayers,
        phase: 'night',
        dayCount: 1,
        nightDeaths: [],
        voteTally: {},
        settings: settings,
        timerDuration: null,
        timerStartAt: null,
        winner: null,
        dayDeath: null,
        hunterNextPhase: null,
        hunterShotPlayer: null
      };
    }),
    applyNightResults: assign(({ context, event }) => {
      const nightDeaths = event.nightDeaths || [];
      const deadIds = nightDeaths.map(d => d.id);

      // Cập nhật người chơi chết
      const updatedPlayers = context.players.map(p => {
        if (deadIds.includes(p.id)) {
          return { ...p, isAlive: false };
        }
        return p;
      });

      return {
        players: updatedPlayers,
        nightDeaths: nightDeaths,
        phase: 'dayStart',
        dayDeath: null,
        hunterShotPlayer: null // Reset
      };
    }),
    applyVotingResults: assign(({ context, event }) => {
      const eliminatedPlayer = event.eliminatedPlayer; // { id, name, role } hoặc null
      
      const updatedPlayers = context.players.map(p => {
        if (eliminatedPlayer && p.id === eliminatedPlayer.id) {
          return { ...p, isAlive: false };
        }
        return p;
      });

      return {
        players: updatedPlayers,
        dayDeath: eliminatedPlayer,
        phase: 'night', // Sẽ được cập nhật lại nếu qua Hunter
        hunterShotPlayer: null
      };
    }),
    applyHunterShot: assign(({ context, event }) => {
      const shotPlayerId = event.shotPlayerId;
      const updatedPlayers = context.players.map(p => {
        if (p.id === shotPlayerId) {
          return { ...p, isAlive: false };
        }
        return p;
      });
      
      const shotPlayer = context.players.find(p => p.id === shotPlayerId);
      
      return {
        players: updatedPlayers,
        hunterShotPlayer: shotPlayer ? { id: shotPlayer.id, name: shotPlayer.name, role: shotPlayer.role } : null,
        timerDuration: null,
        timerStartAt: null
      };
    }),
    setWinner: assign(({ context }) => {
      const winResult = checkWinCondition(context.players);
      return {
        phase: 'gameOver' as const,
        winner: winResult.winner as import('../types/game.ts').Faction | null,
        timerDuration: null,
        timerStartAt: null
      };
    })
  },
  guards: {
    checkWinCondition: ({ context }) => {
      const winResult = checkWinCondition(context.players);
      return winResult.isGameOver;
    },
    hasHunterDiedNight: ({ context, event }) => {
      const nightDeaths = event.nightDeaths || [];
      return nightDeaths.some(d => d.role === 'HUNTER');
    },
    hasHunterDiedVote: ({ context, event }) => {
      const eliminatedPlayer = event.eliminatedPlayer;
      return eliminatedPlayer?.role === 'HUNTER';
    }
  }
}).createMachine({
  id: 'werewolf-game',
  initial: 'Lobby',
  context: {
    players: [], // { id, name, role, faction, isAlive, isHost, disconnected }
    phase: 'lobby',
    dayCount: 0,
    nightDeaths: [],
    voteTally: {},
    settings: { roles: [] }, // Default empty roles
    timerDuration: null,
    timerStartAt: null,
    winner: null,
    dayDeath: null,
    hunterNextPhase: null,
    hunterShotPlayer: null
  },
  states: {
    Lobby: {
      on: {
        START_GAME: {
          target: 'NightPhase',
          actions: ['setupGame', 'notifyPlayers']
        }
      }
    },
    NightPhase: {
      entry: ['runNightStart', 'notifyPlayers'],
      on: {
        ALL_NIGHT_ACTIONS_DONE: [
          {
            target: 'GameOver',
            guard: 'checkWinCondition',
            actions: ['applyNightResults', 'setWinner', 'notifyPlayers']
          },
          {
            target: 'HunterRetaliation',
            guard: 'hasHunterDiedNight',
            actions: [
              'applyNightResults',
              assign({ phase: 'hunterRetaliation', hunterNextPhase: 'dayStart' }),
              'notifyPlayers'
            ]
          },
          {
            target: 'DayPhase',
            actions: ['applyNightResults', 'notifyPlayers']
          }
        ]
      }
    },
    DayPhase: {
      initial: 'DayStart',
      states: {
        DayStart: {
          entry: ['startDayStartTimer', 'notifyPlayers'],
          on: {
            TIMER_EXPIRED: {
              target: 'DayDiscuss',
              actions: assign({ phase: 'dayDiscuss' })
            }
          }
        },
        DayDiscuss: {
          entry: ['startDayDiscussTimer', 'notifyPlayers'],
          on: {
            TIMER_EXPIRED: {
              target: '#werewolf-game.VotingPhase',
              actions: assign({ phase: 'voting' })
            }
          }
        }
      }
    },
    VotingPhase: {
      entry: ['startVotingTimer', 'notifyPlayers'],
      on: {
        VOTING_DONE: [
          {
            target: 'GameOver',
            guard: 'checkWinCondition',
            actions: ['applyVotingResults', 'setWinner', 'notifyPlayers']
          },
          {
            target: 'HunterRetaliation',
            guard: 'hasHunterDiedVote',
            actions: [
              'applyVotingResults',
              assign({ phase: 'hunterRetaliation', hunterNextPhase: 'night' }),
              'notifyPlayers'
            ]
          },
          {
            target: 'NightPhase',
            actions: [
              'applyVotingResults',
              assign({
                phase: 'night',
                dayCount: ({ context }) => context.dayCount + 1,
                voteTally: {}
              }),
              'notifyPlayers'
            ]
          }
        ],
        TIMER_EXPIRED: {
          actions: ['autoResolveVotes']
        }
      }
    },
    HunterRetaliation: {
      entry: ['runHunterRetaliationStart', 'notifyPlayers'],
      on: {
        HUNTER_SHOT_DONE: [
          {
            target: 'GameOver',
            guard: 'checkWinCondition',
            actions: ['applyHunterShot', 'setWinner', 'notifyPlayers']
          },
          {
            target: 'DayPhase',
            guard: ({ context }) => context.hunterNextPhase === 'dayStart',
            actions: ['applyHunterShot', 'notifyPlayers']
          },
          {
            target: 'NightPhase',
            guard: ({ context }) => context.hunterNextPhase === 'night',
            actions: [
              'applyHunterShot',
              assign({
                phase: 'night',
                dayCount: ({ context }) => context.dayCount + 1,
                voteTally: {}
              }),
              'notifyPlayers'
            ]
          }
        ],
        TIMER_EXPIRED: [
          {
            target: 'DayPhase',
            guard: ({ context }) => context.hunterNextPhase === 'dayStart',
            actions: [assign({ phase: 'dayStart', timerDuration: null, timerStartAt: null }), 'notifyPlayers']
          },
          {
            target: 'NightPhase',
            guard: ({ context }) => context.hunterNextPhase === 'night',
            actions: [
              assign({
                phase: 'night',
                dayCount: ({ context }) => context.dayCount + 1,
                voteTally: {},
                timerDuration: null,
                timerStartAt: null
              }),
              'notifyPlayers'
            ]
          }
        ]
      }
    },
    GameOver: {
      entry: ['startGameOverTimer', 'notifyPlayers']
    }
  }
});
