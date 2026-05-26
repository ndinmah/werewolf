import { setup, assign } from 'xstate';
import { checkWinCondition } from './winCondition.ts';
import { ROLES } from '../roles/index.ts';
import type { GameContext, GameEvent, Faction } from '../types/game.ts';

// Định nghĩa state machine cho một phòng game Ma Sói Ma Sói
export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  actions: {
    notifyPlayers: () => {
      // Sẽ được inject từ bên ngoài ở gameStateManager.js
    },
    runFirstNightStart: () => {
      // Sẽ được inject từ bên ngoài
    },
    startRoleRevealTimer: () => {
      // Sẽ được inject từ bên ngoài
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
    applyPlayerReconnect: assign(({ context, event }) => {
      // Cập nhật socket id mới cho player đã reconnect qua assign (không mutation trực tiếp)
      const { oldId, newId } = event;
      if (!oldId || !newId) return {};
      return {
        players: context.players.map(p =>
          p.id === oldId ? { ...p, id: newId, disconnected: false } : p
        )
      };
    }),
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
        const roleData = ROLES[roleId as keyof typeof ROLES] || ROLES.VILLAGER;
        return {
          ...p,
          role: roleId,
          faction: roleData.faction as Faction,
          isAlive: true,
          disconnected: false,
        };
      });

      return {
        players: assignedPlayers,
        phase: 'roleReveal',
        dayCount: 1,
        nightDeaths: [],
        voteTally: {},
        settings: settings,
        timerDuration: null,
        timerStartAt: null,
        winner: null,
        dayDeath: null,
        hunterNextPhase: null,
        hunterShotPlayer: null,
        witchHeals: false,
        witchPoisons: false,
        lovers: [],
      };
    }),
    applyNightResults: assign(({ context, event }) => {
      const nightDeaths = event.nightDeaths || [];
      const deadIds = nightDeaths.map((d) => d.id);

      // Cập nhật người chơi chết
      const updatedPlayers = context.players.map((p) => {
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
        hunterShotPlayer: null, // Reset
      };
    }),
    applyVotingResults: assign(({ context, event }) => {
      const eliminatedPlayer = event.eliminatedPlayer; // { id, name, role } hoặc null

      const updatedPlayers = context.players.map((p) => {
        if (eliminatedPlayer && p.id === eliminatedPlayer.id) {
          return { ...p, isAlive: false };
        }
        return p;
      });

      return {
        players: updatedPlayers,
        dayDeath: eliminatedPlayer,
        phase: 'night', // Sẽ được cập nhật lại nếu qua Hunter
        hunterShotPlayer: null,
      };
    }),
    applyHunterShot: assign(({ context, event }) => {
      const shotPlayerId = event.shotPlayerId;
      const updatedPlayers = context.players.map((p) => {
        if (p.id === shotPlayerId) {
          return { ...p, isAlive: false };
        }
        return p;
      });

      const shotPlayer = context.players.find((p) => p.id === shotPlayerId);

      return {
        players: updatedPlayers,
        hunterShotPlayer: shotPlayer ? { id: shotPlayer.id, name: shotPlayer.name, role: shotPlayer.role } : null,
        timerDuration: null,
        timerStartAt: null,
      };
    }),
    setWinner: assign(({ context }) => {
      const winResult = checkWinCondition(context.players);
      return {
        phase: 'gameOver' as const,
        winner: winResult.winner as import('../types/game.ts').Faction | null,
        timerDuration: null,
        timerStartAt: null,
      };
    }),
  },
  guards: {
    checkWinCondition: ({ context }) => {
      const winResult = checkWinCondition(context.players);
      return winResult.isGameOver;
    },
    hasHunterDiedNight: ({ context }) => {
      const nightDeaths = context.nightDeaths || [];
      return nightDeaths.some((d) => d.role === 'HUNTER');
    },
    hasHunterDiedVote: ({ context }) => {
      const eliminatedPlayer = context.dayDeath;
      return eliminatedPlayer?.role === 'HUNTER';
    },
  },
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
    hunterShotPlayer: null,
    witchHeals: false,
    witchPoisons: false,
    lovers: [],
  },
  states: {
    Lobby: {
      on: {
        START_GAME: {
          target: 'RoleRevealPhase',
          actions: ['setupGame', 'notifyPlayers'],
        },
      },
    },
    RoleRevealPhase: {
      entry: ['startRoleRevealTimer', 'notifyPlayers'],
      on: {
        TIMER_EXPIRED: {
          target: 'FirstNightPhase',
          actions: [
            assign({ phase: 'firstNight' }),
            'notifyPlayers',
          ],
        },
        PLAYER_RECONNECTED: {
          actions: ['applyPlayerReconnect'],
        },
      },
    },
    FirstNightPhase: {
      entry: ['runFirstNightStart', 'notifyPlayers'],
      on: {
        PLAYER_RECONNECTED: {
          actions: ['applyPlayerReconnect'],
        },
        FIRST_NIGHT_DONE: {
          target: 'NightPhase',
          actions: [
            assign({ phase: 'night' }),
            'notifyPlayers'
          ],
        },
      },
    },
    NightPhase: {
      entry: ['runNightStart', 'notifyPlayers'],
      on: {
        PLAYER_RECONNECTED: {
          actions: ['applyPlayerReconnect'],
        },
        ALL_NIGHT_ACTIONS_DONE: {
          target: 'NightResolve',
          actions: ['applyNightResults'],
        },
      },
    },
    NightResolve: {
      always: [
        {
          // Ưu tiên kiểm tra Thợ Săn TRƯỚC điều kiện thắng:
          // Nếu Thợ Săn chết đêm nay, họ vẫn có quyền bắn trả trước khi kết thúc game
          target: 'HunterRetaliation',
          guard: 'hasHunterDiedNight',
          actions: [
            assign({ phase: 'hunterRetaliation', hunterNextPhase: 'dayStart' }),
            'notifyPlayers',
          ],
        },
        {
          target: 'GameOver',
          guard: 'checkWinCondition',
          actions: ['setWinner', 'notifyPlayers'],
        },
        {
          target: 'DayPhase',
          actions: ['notifyPlayers'],
        },
      ],
    },
    DayPhase: {
      initial: 'DayStart',
      states: {
        DayStart: {
          entry: ['startDayStartTimer', 'notifyPlayers'],
          on: {
            TIMER_EXPIRED: {
              target: 'DayDiscuss',
              actions: assign({ phase: 'dayDiscuss' }),
            },
          },
        },
        DayDiscuss: {
          entry: ['startDayDiscussTimer', 'notifyPlayers'],
          on: {
            TIMER_EXPIRED: {
              target: '#werewolf-game.VotingPhase',
              actions: assign({ phase: 'voting' }),
            },
          },
        },
      },
    },
    VotingPhase: {
      entry: ['startVotingTimer', 'notifyPlayers'],
      on: {
        VOTING_DONE: {
          target: 'VoteResolve',
          actions: ['applyVotingResults'],
        },
        TIMER_EXPIRED: {
          actions: ['autoResolveVotes'],
        },
      },
    },
    VoteResolve: {
      always: [
        {
          // Ưu tiên kiểm tra Thợ Săn TRƯỚC điều kiện thắng:
          // Nếu Thợ Săn bị vote chết, họ vẫn có quyền bắn trả trước khi kết thúc game
          target: 'HunterRetaliation',
          guard: 'hasHunterDiedVote',
          actions: [
            assign({ phase: 'hunterRetaliation', hunterNextPhase: 'night' }),
            'notifyPlayers',
          ],
        },
        {
          target: 'GameOver',
          guard: 'checkWinCondition',
          actions: ['setWinner', 'notifyPlayers'],
        },
        {
          target: 'NightPhase',
          actions: [
            assign({
              phase: 'night',
              dayCount: ({ context }) => context.dayCount + 1,
              voteTally: {},
            }),
            'notifyPlayers',
          ],
        },
      ],
    },
    HunterRetaliation: {
      entry: ['runHunterRetaliationStart', 'notifyPlayers'],
      on: {
        HUNTER_SHOT_DONE: {
          target: 'HunterResolve',
          actions: ['applyHunterShot'],
        },
        TIMER_EXPIRED: [
          {
            target: 'DayPhase',
            guard: ({ context }) => context.hunterNextPhase === 'dayStart',
            actions: [assign({ phase: 'dayStart', timerDuration: null, timerStartAt: null }), 'notifyPlayers'],
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
                timerStartAt: null,
              }),
              'notifyPlayers',
            ],
          },
        ],
      },
    },
    HunterResolve: {
      always: [
        {
          target: 'GameOver',
          guard: 'checkWinCondition',
          actions: ['setWinner', 'notifyPlayers'],
        },
        {
          target: 'DayPhase',
          guard: ({ context }) => context.hunterNextPhase === 'dayStart',
          actions: ['notifyPlayers'],
        },
        {
          target: 'NightPhase',
          guard: ({ context }) => context.hunterNextPhase === 'night',
          actions: [
            assign({
              phase: 'night',
              dayCount: ({ context }) => context.dayCount + 1,
              voteTally: {},
            }),
            'notifyPlayers',
          ],
        },
      ],
    },
    GameOver: {
      entry: ['startGameOverTimer', 'notifyPlayers'],
    },
  },
});
