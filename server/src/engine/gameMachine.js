import { setup } from 'xstate';

// Định nghĩa state machine cho một phòng game
export const gameMachine = setup({
  types: {
    context: {},
    events: {}
  },
  actions: {
    notifyPlayers: () => {
      // Sẽ được inject từ bên ngoài (handler)
    }
  }
}).createMachine({
  id: 'werewolf-game',
  initial: 'Lobby',
  context: {
    players: [],
    dayCount: 0,
    history: []
  },
  states: {
    Lobby: {
      on: {
        START_GAME: 'NightPhase'
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
            target: 'NightPhase'
          }
        ]
      }
    },
    GameOver: {
      type: 'final'
    }
  }
});
