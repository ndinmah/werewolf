import { setup, assign } from 'xstate';

// Định nghĩa state machine cho một phòng game
export const gameMachine = setup({
  types: {
    context: {},
    events: {}
  },
  actions: {
    notifyPlayers: () => {
      // Sẽ được inject từ bên ngoài (handler)
    },
    setupGame: assign({
      players: ({ context, event }) => {
        // Trong tương lai sẽ có logic xào bài và gán role thực tế ở đây
        // Tạm thời lấy danh sách players từ event, set default role và isAlive
        return (event.players || context.players).map(p => ({
          ...p,
          role: p.role || 'villager',
          faction: p.faction || 'village',
          isAlive: true
        }));
      },
      phase: 'night',
      dayCount: 1,
      nightDeaths: [],
      voteTally: {}
    })
  }
}).createMachine({
  id: 'werewolf-game',
  initial: 'Lobby',
  context: {
    players: [], // { id, name, role, faction, isAlive, isHost }
    phase: 'lobby', // 'lobby' | 'night' | 'day' | 'voting' | 'gameOver'
    dayCount: 0,
    nightDeaths: [],
    voteTally: {},
    history: []
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
      entry: 'notifyPlayers',
      on: {
        ALL_NIGHT_ACTIONS_DONE: 'DayPhase'
      }
    },
    DayPhase: {
      entry: 'notifyPlayers',
      on: {
        START_VOTING: 'VotingPhase'
      }
    },
    VotingPhase: {
      entry: 'notifyPlayers',
      on: {
        VOTING_DONE: [
          {
            target: 'GameOver',
            guard: 'checkWinCondition'
          },
          {
            target: 'NightPhase',
            actions: assign({
              phase: 'night',
              dayCount: ({ context }) => context.dayCount + 1,
              voteTally: {}
            })
          }
        ]
      }
    },
    GameOver: {
      type: 'final'
    }
  }
});
