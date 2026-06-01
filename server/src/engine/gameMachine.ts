import { setup, assign } from 'xstate';
import { checkWinCondition } from './winCondition.ts';
import { ROLES } from '../roles/index.ts';
import { RoleRegistry } from '../roles/RoleHandler.ts';
import type { GameContext, GameEvent, Faction } from '../types/game.ts';
import { addLoverDeaths, getNewlyDeadPlayerIds } from './gameHelpers.ts';

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
    runNightWave1Start: () => {
      // Sẽ được inject từ bên ngoài
    },
    runNightWave2Start: () => {
      // Sẽ được inject từ bên ngoài
    },
    startNightWave1Timer: () => {
      // Sẽ được inject từ bên ngoài
    },
    startNightWave2Timer: () => {
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
        players: context.players.map((p) => (p.id === oldId ? { ...p, id: newId, disconnected: false } : p)),
      };
    }),
    applyPlayerDisconnect: assign(({ context, event }) => {
      const playerId = event.playerId as string | undefined;
      if (!playerId) return {};
      return {
        players: context.players.map((p) => (p.id === playerId ? { ...p, disconnected: true } : p)),
      };
    }),
    applyLovers: assign(({ context, event }) => {
      const lover1Id = event.lover1Id as string | undefined;
      const lover2Id = event.lover2Id as string | undefined;
      if (!lover1Id || !lover2Id) return {} as Partial<GameContext>;

      // Tạo bản sao mới của danh sách người chơi để tránh mutation trực tiếp
      const updatedPlayers = context.players.map((p) => {
        if (p.id === lover1Id || p.id === lover2Id) {
          const partnerId = p.id === lover1Id ? lover2Id : lover1Id;
          const partner = context.players.find((x) => x.id === partnerId);

          const role1 = p.role ? ROLES[p.role as keyof typeof ROLES] : null;
          const role2 = partner?.role ? ROLES[partner.role as keyof typeof ROLES] : null;

          if (role1 && role2 && role1.faction !== role2.faction) {
            return { ...p, faction: 'THIRD_PARTY' as const };
          }
        }
        return p;
      });

      return {
        lovers: [lover1Id, lover2Id],
        players: updatedPlayers,
      } as Partial<GameContext>;
    }),
    applyDoppelgangerSelection: assign(({ event }) => {
      return {
        doppelgangerTargets: event.doppelgangerTargets || {},
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
        pendingRetaliation: false,
        pendingRetaliationHunterId: null,
        roomId: event.roomId || context.roomId || '',
        elderShields: assignedPlayers.some((p) => p.role === 'ELDER') ? 1 : 0,
        villagersLostPowers: false,
        doppelgangerTargets: {},
      };
    }),
    applyNightResults: assign(({ context, event }) => {
      const initialNightDeaths = event.nightDeaths || [];
      const deadIds = new Set(initialNightDeaths.map((d) => d.id));
      const nightDeaths = [...initialNightDeaths];
      const transformedIds = new Set(event.transformedIds || []);

      // Xử lý chết chùm người tình ban đêm bằng helper dùng chung
      addLoverDeaths(deadIds, context.lovers, context.players, nightDeaths);

      // Cập nhật người chơi chết và người chơi hóa Sói
      let updatedPlayers = context.players.map((p) => {
        if (transformedIds.has(p.id)) {
          return { ...p, role: 'WEREWOLF' as const, faction: 'WEREWOLF' as const };
        }
        if (deadIds.has(p.id)) {
          return { ...p, isAlive: false };
        }
        return p;
      });

      // Recalculate Lover Factions in case of transformation (Cursed becoming Wolf)
      if (context.lovers && context.lovers.length === 2) {
        const [l1, l2] = context.lovers;
        const p1 = updatedPlayers.find(p => p.id === l1);
        const p2 = updatedPlayers.find(p => p.id === l2);
        
        if (p1 && p2) {
          // Determine base factions without THIRD_PARTY override
          const role1 = p1.role ? ROLES[p1.role as keyof typeof ROLES] : null;
          const role2 = p2.role ? ROLES[p2.role as keyof typeof ROLES] : null;
          
          if (role1 && role2 && role1.faction !== role2.faction) {
            updatedPlayers = updatedPlayers.map(p => 
              (p.id === l1 || p.id === l2) ? { ...p, faction: 'THIRD_PARTY' as const } : p
            );
          }
        }
      }

      // Xác định các player vừa chết bằng helper dùng chung để xử lý onDeath hook ở action sau
      const newlyDeadPlayerIds = getNewlyDeadPlayerIds(context.players, updatedPlayers);

      return {
        players: updatedPlayers,
        nightDeaths: nightDeaths,
        phase: 'dayStart',
        dayDeath: null,
        hunterShotPlayer: null, // Reset
        newlyDeadPlayerIds,
        elderShields: event.elderShields !== undefined ? event.elderShields : context.elderShields,
      };
    }),
    applyVotingResults: assign(({ context, event }) => {
      const eliminatedPlayer = event.eliminatedPlayer; // { id, name, role } hoặc null
      const deadIds = new Set<string>();
      if (eliminatedPlayer) {
        deadIds.add(eliminatedPlayer.id);
      }

      // Xử lý chết chùm người tình khi bị vote bằng helper dùng chung
      addLoverDeaths(deadIds, context.lovers, context.players);

      const updatedPlayers = context.players.map((p) => {
        if (deadIds.has(p.id)) {
          return { ...p, isAlive: false };
        }
        return p;
      });

      // Xác định các player vừa chết bằng helper dùng chung để xử lý onDeath hook ở action sau
      const newlyDeadPlayerIds = getNewlyDeadPlayerIds(context.players, updatedPlayers);

      return {
        players: updatedPlayers,
        dayDeath: eliminatedPlayer,
        phase: 'night', // Sẽ được cập nhật lại nếu qua Hunter
        hunterShotPlayer: null,
        newlyDeadPlayerIds,
      };
    }),
    applyHunterShot: assign(({ context, event }) => {
      const shotPlayerId = event.shotPlayerId;
      const deadIds = new Set<string>();
      if (shotPlayerId) {
        deadIds.add(shotPlayerId);
      }

      // Xử lý chết chùm người tình khi bị Thợ Săn bắn bằng helper dùng chung
      addLoverDeaths(deadIds, context.lovers, context.players);

      const updatedPlayers = context.players.map((p) => {
        if (deadIds.has(p.id)) {
          return { ...p, isAlive: false };
        }
        return p;
      });

      const shotPlayer = context.players.find((p) => p.id === shotPlayerId);

      // Xác định các player vừa chết bằng helper dùng chung để xử lý onDeath hook ở action sau
      const newlyDeadPlayerIds = getNewlyDeadPlayerIds(context.players, updatedPlayers);

      return {
        players: updatedPlayers,
        hunterShotPlayer: shotPlayer ? { id: shotPlayer.id, name: shotPlayer.name, role: shotPlayer.role } : null,
        timerDuration: null,
        timerStartAt: null,
        pendingRetaliation: false, // Clear flag sau khi Hunter đã bắn
        pendingRetaliationHunterId: null,
        newlyDeadPlayerIds,
      };
    }),
    triggerDeathHooks: assign(({ context, event }) => {
      const deadIds = context.newlyDeadPlayerIds || [];
      if (deadIds.length === 0) return {};

      let additionalUpdates: Partial<GameContext> = {};
      const cause =
        event.type === 'ALL_NIGHT_ACTIONS_DONE' ? 'night' : event.type === 'VOTING_DONE' ? 'vote' : 'hunter';

      const updatedPlayers = [...context.players];
      let playersChanged = false;
      const nightActions = event.nightActions;

      deadIds.forEach((id) => {
        const deadPlayer = context.players.find((x) => x.id === id);
        if (!deadPlayer) return;

        // Xử lý kế thừa vai trò của Kẻ nhân bản
        Object.entries(context.doppelgangerTargets || {}).forEach(([dgId, targetId]) => {
          if (targetId === id) {
            const dgIdx = updatedPlayers.findIndex((p) => p.id === dgId && p.isAlive && p.role === 'DOPPELGANGER');
            if (dgIdx !== -1) {
              const originalRole = deadPlayer.role || 'VILLAGER';
              const originalRoleConfig = ROLES[originalRole as keyof typeof ROLES] || ROLES.VILLAGER;
              updatedPlayers[dgIdx] = {
                ...updatedPlayers[dgIdx],
                role: originalRole,
                faction: originalRoleConfig.faction as Faction,
              };
              playersChanged = true;
              
              if (originalRole === 'ELDER') {
                additionalUpdates = { ...additionalUpdates, elderShields: 1 };
              }
            }
          }
        });

        const p = context.players.find((x) => x.id === id);
        if (p) {
          const handler = p.role ? RoleRegistry.getHandler(p.role) : null;
          if (handler && handler.onDeath) {
            const updates = handler.onDeath(context.roomId || '', p, context, cause, nightActions);
            if (updates) {
              additionalUpdates = { ...additionalUpdates, ...updates };
            }
          }
        }
      });

      if (playersChanged && context.lovers && context.lovers.length === 2) {
        const [l1, l2] = context.lovers;
        const p1 = updatedPlayers.find(p => p.id === l1);
        const p2 = updatedPlayers.find(p => p.id === l2);
        
        if (p1 && p2) {
          const role1 = p1.role ? ROLES[p1.role as keyof typeof ROLES] : null;
          const role2 = p2.role ? ROLES[p2.role as keyof typeof ROLES] : null;
          
          if (role1 && role2 && role1.faction !== role2.faction) {
            updatedPlayers.forEach((p, idx) => {
              if (p.id === l1 || p.id === l2) {
                updatedPlayers[idx] = { ...p, faction: 'THIRD_PARTY' as const };
              }
            });
          }
        }
      }

      return {
        ...additionalUpdates,
        players: playersChanged ? updatedPlayers : context.players,
        newlyDeadPlayerIds: [], // Reset danh sách
      };
    }),
    setWinner: assign(({ context }) => {
      const winResult = checkWinCondition(context.players, context.dayDeath, context.lovers, context.hunterShotPlayer);
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
      const winResult = checkWinCondition(context.players, context.dayDeath, context.lovers, context.hunterShotPlayer);
      return winResult.isGameOver;
    },
    hasHunterDiedNight: ({ context }) => {
      return !!context.pendingRetaliation;
    },
    hasHunterDiedVote: ({ context }) => {
      return !!context.pendingRetaliation;
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
    pendingRetaliation: false,
    pendingRetaliationHunterId: null,
    newlyDeadPlayerIds: [],
    roomId: '',
    elderShields: 0,
    villagersLostPowers: false,
    doppelgangerTargets: {},
  },
  on: {
    PLAYER_RECONNECTED: {
      actions: ['applyPlayerReconnect', 'notifyPlayers'],
    },
    PLAYER_DISCONNECTED: {
      actions: ['applyPlayerDisconnect', 'notifyPlayers'],
    },
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
          actions: [assign({ phase: 'firstNight' }), 'notifyPlayers'],
        },
      },
    },
    FirstNightPhase: {
      entry: ['runFirstNightStart', 'notifyPlayers'],
      on: {
        SET_LOVERS: {
          actions: ['applyLovers', 'notifyPlayers'],
        },
        FIRST_NIGHT_DONE: {
          target: 'NightPhase',
          actions: [assign({ phase: 'night' }), 'applyDoppelgangerSelection', 'notifyPlayers'],
        },
      },
    },
    NightPhase: {
      initial: 'NightWave1',
      entry: [assign({ phase: 'night', nightWave: 1 }), 'runNightWave1Start', 'notifyPlayers'],
      exit: [assign({ nightWave: undefined })],
      states: {
        NightWave1: {
          entry: ['startNightWave1Timer'],
          on: {
            NIGHT_WAVE1_DONE: {
              target: 'NightWave2',
              actions: [assign({ nightWave: 2 }), 'runNightWave2Start', 'notifyPlayers'],
            },
          },
        },
        NightWave2: {
          entry: ['startNightWave2Timer'],
          on: {
            ALL_NIGHT_ACTIONS_DONE: {
              target: '#werewolf-game.NightResolve',
              actions: ['applyNightResults', 'triggerDeathHooks'],
            },
          },
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
          actions: [assign({ phase: 'hunterRetaliation', hunterNextPhase: 'dayStart' }), 'notifyPlayers'],
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
          actions: ['applyVotingResults', 'triggerDeathHooks'],
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
          actions: [assign({ phase: 'hunterRetaliation', hunterNextPhase: 'night' }), 'notifyPlayers'],
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
          actions: ['applyHunterShot', 'triggerDeathHooks'],
        },
        TIMER_EXPIRED: [
          {
            target: 'DayPhase',
            guard: ({ context }) => context.hunterNextPhase === 'dayStart',
            actions: [
              assign({
                phase: 'dayStart',
                timerDuration: null,
                timerStartAt: null,
                pendingRetaliation: false,
                pendingRetaliationHunterId: null,
              }),
              'notifyPlayers',
            ],
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
                pendingRetaliation: false,
                pendingRetaliationHunterId: null,
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
          target: 'HunterRetaliation',
          guard: ({ context }) => !!context.pendingRetaliation,
          actions: ['notifyPlayers'],
        },
        {
          target: 'GameOver',
          guard: 'checkWinCondition',
          actions: ['setWinner', 'notifyPlayers'],
        },
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
    GameOver: {
      entry: ['startGameOverTimer', 'notifyPlayers'],
    },
  },
});
