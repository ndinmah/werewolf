import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSocket } from './SocketContext';
import type {
  GameState,
  ChatLogs,
  ChatMessage,
  Player,
  SeerVision,
  NightActionPrompt,
  VotingResult,
  NightStatus,
  HunterPrompt,
  HunterShotResult,
  WolfRevealInfo,
  LoverRevealInfo,
} from '../types/game';

interface GameContextValue {
  gameState: GameState | null;
  chatLogs: ChatLogs;
  myPlayer: Player | undefined;
  phase: GameState['phase'] | undefined;
  dayCount: number | undefined;
  players: Player[];
  seerVisions: SeerVision[];
  nightActionPrompt: NightActionPrompt | null;
  setNightActionPrompt: React.Dispatch<React.SetStateAction<NightActionPrompt | null>>;
  votingResult: VotingResult | null;
  setVotingResult: React.Dispatch<React.SetStateAction<VotingResult | null>>;
  nightStatus: NightStatus | null;
  hunterPrompt: HunterPrompt | null;
  setHunterPrompt: React.Dispatch<React.SetStateAction<HunterPrompt | null>>;
  hunterShotResult: HunterShotResult | null;
  wolfReveal: WolfRevealInfo | null;
  loverReveal: LoverRevealInfo | null;
}

const defaultChatLogs: ChatLogs = { general: [], wolves: [], ghost: [] };

const GameContext = createContext<GameContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = (): GameContextValue => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

interface GameReducerState {
  gameState: GameState | null;
  chatLogs: ChatLogs;
  seerVisions: SeerVision[];
  nightActionPrompt: NightActionPrompt | null;
  votingResult: VotingResult | null;
  nightStatus: NightStatus | null;
  hunterPrompt: HunterPrompt | null;
  hunterShotResult: HunterShotResult | null;
  wolfReveal: WolfRevealInfo | null;
  loverReveal: LoverRevealInfo | null;
}

const initialState: GameReducerState = {
  gameState: null,
  chatLogs: defaultChatLogs,
  seerVisions: [],
  nightActionPrompt: null,
  votingResult: null,
  nightStatus: null,
  hunterPrompt: null,
  hunterShotResult: null,
  wolfReveal: null,
  loverReveal: null,
};

type GameAction =
  | { type: 'GAME_STATE_UPDATE'; payload: GameState }
  | { type: 'CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'RECONNECT_SUCCESS'; payload: { gameState: GameState; chatLogs: ChatLogs; seerVisions: SeerVision[] } }
  | { type: 'PLAYER_DISCONNECTED'; payload: { playerId: string } }
  | { type: 'NIGHT_ACTION_PROMPT'; payload: NightActionPrompt | null }
  | { type: 'NIGHT_STATUS_UPDATE'; payload: NightStatus | null }
  | { type: 'SEER_RESULT'; payload: SeerVision }
  | { type: 'VOTING_RESULT'; payload: VotingResult | null }
  | { type: 'HUNTER_RETALIATION_PROMPT'; payload: HunterPrompt | null }
  | { type: 'HUNTER_SHOT_RESULT'; payload: HunterShotResult | null }
  | { type: 'SET_NIGHT_ACTION_PROMPT'; payload: NightActionPrompt | null | ((prev: NightActionPrompt | null) => NightActionPrompt | null) }
  | { type: 'SET_VOTING_RESULT'; payload: VotingResult | null | ((prev: VotingResult | null) => VotingResult | null) }
  | { type: 'SET_HUNTER_PROMPT'; payload: HunterPrompt | null | ((prev: HunterPrompt | null) => HunterPrompt | null) }
  | { type: 'FIRST_NIGHT_WOLF_REVEAL'; payload: WolfRevealInfo | null }
  | { type: 'FIRST_NIGHT_LOVERS_REVEAL'; payload: LoverRevealInfo | null }
  | { type: 'GAME_RESET' };

function gameReducer(state: GameReducerState, action: GameAction): GameReducerState {
  switch (action.type) {
    case 'GAME_STATE_UPDATE': {
      const update = action.payload;
      return {
        ...state,
        gameState: update,
        nightActionPrompt: (update.phase !== 'night' && update.phase !== 'firstNight') ? null : state.nightActionPrompt,
        nightStatus: (update.phase !== 'night' && update.phase !== 'firstNight') ? null : state.nightStatus,
        votingResult: update.phase !== 'voting' ? null : state.votingResult,
        hunterPrompt: update.phase !== 'hunterRetaliation' ? null : state.hunterPrompt,
        // Reset shot result khi bắt đầu phase retaliation mới
        hunterShotResult: update.phase === 'hunterRetaliation' ? null : state.hunterShotResult,
        wolfReveal: update.phase !== 'firstNight' ? null : state.wolfReveal,
        loverReveal: update.phase !== 'firstNight' ? null : state.loverReveal,
      };
    }
    case 'CHAT_MESSAGE':
      return {
        ...state,
        chatLogs: {
          ...state.chatLogs,
          [action.payload.channel]: [...(state.chatLogs[action.payload.channel] || []), action.payload],
        },
      };
    case 'RECONNECT_SUCCESS':
      return {
        ...state,
        gameState: action.payload.gameState,
        chatLogs: action.payload.chatLogs || defaultChatLogs,
        seerVisions: action.payload.seerVisions || [],
      };
    case 'PLAYER_DISCONNECTED': {
      if (!state.gameState) return state;
      return {
        ...state,
        gameState: {
          ...state.gameState,
          players: state.gameState.players.map((p) =>
            p.id === action.payload.playerId ? { ...p, disconnected: true } : p
          ),
        },
      };
    }
    case 'NIGHT_ACTION_PROMPT':
      return {
        ...state,
        nightActionPrompt: action.payload,
      };
    case 'NIGHT_STATUS_UPDATE':
      return {
        ...state,
        nightStatus: action.payload,
      };
    case 'SEER_RESULT': {
      const newVision = action.payload;
      const existingIndex = state.seerVisions.findIndex(v => v.targetId === newVision.targetId);
      if (existingIndex >= 0) {
        const updatedVisions = [...state.seerVisions];
        updatedVisions[existingIndex] = newVision;
        return {
          ...state,
          seerVisions: updatedVisions,
        };
      }
      return {
        ...state,
        seerVisions: [...state.seerVisions, newVision],
      };
    }
    case 'VOTING_RESULT':
      return {
        ...state,
        votingResult: action.payload,
      };
    case 'HUNTER_RETALIATION_PROMPT':
      return {
        ...state,
        hunterPrompt: action.payload,
      };
    case 'HUNTER_SHOT_RESULT':
      return {
        ...state,
        hunterShotResult: action.payload,
      };
    case 'SET_NIGHT_ACTION_PROMPT':
      return {
        ...state,
        nightActionPrompt: typeof action.payload === 'function' ? action.payload(state.nightActionPrompt) : action.payload,
      };
    case 'SET_VOTING_RESULT':
      return {
        ...state,
        votingResult: typeof action.payload === 'function' ? action.payload(state.votingResult) : action.payload,
      };
    case 'SET_HUNTER_PROMPT':
      return {
        ...state,
        hunterPrompt: typeof action.payload === 'function' ? action.payload(state.hunterPrompt) : action.payload,
      };
    case 'FIRST_NIGHT_WOLF_REVEAL':
      return {
        ...state,
        wolfReveal: action.payload,
      };
    case 'FIRST_NIGHT_LOVERS_REVEAL':
      return {
        ...state,
        loverReveal: action.payload,
      };
    case 'GAME_RESET':
      return initialState;
    default:
      return state;
  }
}

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useSocket();
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const hunterShotTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wolfRevealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loversRevealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('GAME_STATE_UPDATE', (update: GameState) => {
      dispatch({ type: 'GAME_STATE_UPDATE', payload: update });
    });

    socket.on('CHAT_MESSAGE', (message: ChatMessage) => {
      dispatch({ type: 'CHAT_MESSAGE', payload: message });
    });

    socket.on(
      'RECONNECT_SUCCESS',
      ({
        gameState: gs,
        chatLogs: cl,
        seerVisions: sv,
      }: {
        gameState: GameState;
        chatLogs: ChatLogs;
        seerVisions: SeerVision[];
      }) => {
        dispatch({ type: 'RECONNECT_SUCCESS', payload: { gameState: gs, chatLogs: cl, seerVisions: sv } });
      },
    );

    socket.on('PLAYER_DISCONNECTED', ({ playerId }: { playerId: string }) => {
      dispatch({ type: 'PLAYER_DISCONNECTED', payload: { playerId } });
    });

    socket.on('NIGHT_ACTION_PROMPT', (prompt: NightActionPrompt) => {
      dispatch({ type: 'NIGHT_ACTION_PROMPT', payload: prompt });
    });

    socket.on('NIGHT_STATUS_UPDATE', (status: NightStatus) => {
      dispatch({ type: 'NIGHT_STATUS_UPDATE', payload: status });
    });

    socket.on('SEER_RESULT', (vision: SeerVision) => {
      dispatch({ type: 'SEER_RESULT', payload: vision });
    });

    socket.on('VOTING_RESULT', (result: VotingResult) => {
      dispatch({ type: 'VOTING_RESULT', payload: result });
    });

    socket.on('HUNTER_RETALIATION_PROMPT', (prompt: HunterPrompt) => {
      dispatch({ type: 'HUNTER_RETALIATION_PROMPT', payload: prompt });
    });

    socket.on('HUNTER_SHOT_RESULT', (result: HunterShotResult) => {
      dispatch({ type: 'HUNTER_SHOT_RESULT', payload: result });
      if (hunterShotTimeoutRef.current) {
        clearTimeout(hunterShotTimeoutRef.current);
      }
      hunterShotTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'HUNTER_SHOT_RESULT', payload: null });
        hunterShotTimeoutRef.current = null;
      }, 5000);
    });

    socket.on('FIRST_NIGHT_WOLF_REVEAL', (info: WolfRevealInfo) => {
      dispatch({ type: 'FIRST_NIGHT_WOLF_REVEAL', payload: info });
      if (wolfRevealTimeoutRef.current) {
        clearTimeout(wolfRevealTimeoutRef.current);
      }
      wolfRevealTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'FIRST_NIGHT_WOLF_REVEAL', payload: null });
        wolfRevealTimeoutRef.current = null;
      }, 5000);
    });

    socket.on('FIRST_NIGHT_LOVERS_REVEAL', (info: LoverRevealInfo) => {
      dispatch({ type: 'FIRST_NIGHT_LOVERS_REVEAL', payload: info });
      if (loversRevealTimeoutRef.current) {
        clearTimeout(loversRevealTimeoutRef.current);
      }
      loversRevealTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'FIRST_NIGHT_LOVERS_REVEAL', payload: null });
        loversRevealTimeoutRef.current = null;
      }, 5000);
    });

    socket.on('GAME_RESET', () => {
      dispatch({ type: 'GAME_RESET' });
    });

    const handleConnect = () => {
      // Logic reconnect tự động nếu cần thiết
    };

    socket.on('connect', handleConnect);

    return () => {
      if (hunterShotTimeoutRef.current) clearTimeout(hunterShotTimeoutRef.current);
      if (wolfRevealTimeoutRef.current) clearTimeout(wolfRevealTimeoutRef.current);
      if (loversRevealTimeoutRef.current) clearTimeout(loversRevealTimeoutRef.current);

      socket.off('GAME_STATE_UPDATE');
      socket.off('CHAT_MESSAGE');
      socket.off('RECONNECT_SUCCESS');
      socket.off('PLAYER_DISCONNECTED');
      socket.off('NIGHT_ACTION_PROMPT');
      socket.off('NIGHT_STATUS_UPDATE');
      socket.off('SEER_RESULT');
      socket.off('VOTING_RESULT');
      socket.off('HUNTER_RETALIATION_PROMPT');
      socket.off('HUNTER_SHOT_RESULT');
      socket.off('FIRST_NIGHT_WOLF_REVEAL');
      socket.off('FIRST_NIGHT_LOVERS_REVEAL');
      socket.off('GAME_RESET');
      socket.off('connect', handleConnect);
    };
  }, [socket]);

  // Derived state
  const myPlayer = useMemo(() => {
    return state.gameState?.players?.find((p) => p.id === socket?.id);
  }, [state.gameState?.players, socket?.id]);

  const phase = state.gameState?.phase;
  const dayCount = state.gameState?.dayCount;

  const players = useMemo(() => {
    return state.gameState?.players || [];
  }, [state.gameState?.players]);

  const setNightActionPrompt = useCallback((payload: NightActionPrompt | null | ((prev: NightActionPrompt | null) => NightActionPrompt | null)) => {
    dispatch({ type: 'SET_NIGHT_ACTION_PROMPT', payload });
  }, []);

  const setVotingResult = useCallback((payload: VotingResult | null | ((prev: VotingResult | null) => VotingResult | null)) => {
    dispatch({ type: 'SET_VOTING_RESULT', payload });
  }, []);

  const setHunterPrompt = useCallback((payload: HunterPrompt | null | ((prev: HunterPrompt | null) => HunterPrompt | null)) => {
    dispatch({ type: 'SET_HUNTER_PROMPT', payload });
  }, []);

  const contextValue = useMemo(() => ({
    gameState: state.gameState,
    chatLogs: state.chatLogs,
    myPlayer,
    phase,
    dayCount,
    players,
    seerVisions: state.seerVisions,
    nightActionPrompt: state.nightActionPrompt,
    setNightActionPrompt,
    votingResult: state.votingResult,
    setVotingResult,
    nightStatus: state.nightStatus,
    hunterPrompt: state.hunterPrompt,
    setHunterPrompt,
    hunterShotResult: state.hunterShotResult,
    wolfReveal: state.wolfReveal,
    loverReveal: state.loverReveal,
  }), [
    state.gameState,
    state.chatLogs,
    myPlayer,
    phase,
    dayCount,
    players,
    state.seerVisions,
    state.nightActionPrompt,
    setNightActionPrompt,
    state.votingResult,
    setVotingResult,
    state.nightStatus,
    state.hunterPrompt,
    setHunterPrompt,
    state.hunterShotResult,
    state.wolfReveal,
    state.loverReveal,
  ]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
