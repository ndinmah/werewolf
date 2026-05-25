import { createContext, useContext, useState, useEffect } from 'react';
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
}

const defaultChatLogs: ChatLogs = { general: [], wolves: [], ghost: [] };

const GameContext = createContext<GameContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = (): GameContextValue => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [chatLogs, setChatLogs] = useState<ChatLogs>(defaultChatLogs);

  // Real-time gameplay states
  const [seerVisions, setSeerVisions] = useState<SeerVision[]>([]);
  const [nightActionPrompt, setNightActionPrompt] = useState<NightActionPrompt | null>(null);
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null);
  const [nightStatus, setNightStatus] = useState<NightStatus | null>(null);

  // Hunter states
  const [hunterPrompt, setHunterPrompt] = useState<HunterPrompt | null>(null);
  const [hunterShotResult, setHunterShotResult] = useState<HunterShotResult | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('GAME_STATE_UPDATE', (update: GameState) => {
      setGameState(update);

      // Tự động dọn dẹp prompt ban đêm và status khi không còn là NightPhase
      if (update.phase !== 'night') {
        setNightActionPrompt(null);
        setNightStatus(null);
      }
      // Dọn dẹp votingResult khi không còn ở phase voting
      if (update.phase !== 'voting') {
        setVotingResult(null);
      }
      // Dọn dẹp hunterPrompt khi không ở phase hunterRetaliation
      if (update.phase !== 'hunterRetaliation') {
        setHunterPrompt(null);
      } else {
        // Reset shot result khi bắt đầu phase retaliation mới
        setHunterShotResult(null);
      }
    });

    socket.on('CHAT_MESSAGE', (message: ChatMessage) => {
      setChatLogs((prev) => ({
        ...prev,
        [message.channel]: [...prev[message.channel], message],
      }));
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
        setGameState(gs);
        setChatLogs(cl || defaultChatLogs);
        setSeerVisions(sv || []);
      },
    );

    socket.on('PLAYER_DISCONNECTED', ({ playerId }: { playerId: string }) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === playerId ? { ...p, disconnected: true } : p,
          ),
        };
      });
    });

    // Các socket listeners đặc thù cho Phase 3
    socket.on('NIGHT_ACTION_PROMPT', (prompt: NightActionPrompt) => {
      setNightActionPrompt(prompt);
    });

    socket.on('NIGHT_STATUS_UPDATE', (status: NightStatus) => {
      setNightStatus(status);
    });

    socket.on('SEER_RESULT', (vision: SeerVision) => {
      setSeerVisions((prev) => [...prev, vision]);
    });

    socket.on('VOTING_RESULT', (result: VotingResult) => {
      setVotingResult(result);
    });

    socket.on('HUNTER_RETALIATION_PROMPT', (prompt: HunterPrompt) => {
      setHunterPrompt(prompt);
    });

    socket.on('HUNTER_SHOT_RESULT', (result: HunterShotResult) => {
      setHunterShotResult(result);
    });

    socket.on('GAME_RESET', () => {
      setGameState(null);
      setChatLogs(defaultChatLogs);
      setSeerVisions([]);
      setNightActionPrompt(null);
      setVotingResult(null);
      setNightStatus(null);
      setHunterPrompt(null);
      setHunterShotResult(null);
    });

    const handleConnect = () => {
      // Logic reconnect tự động nếu cần thiết
    };

    socket.on('connect', handleConnect);

    return () => {
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
      socket.off('GAME_RESET');
      socket.off('connect', handleConnect);
    };
  }, [socket]);

  // Derived state
  const myPlayer = gameState?.players?.find((p) => p.id === socket?.id);
  const phase = gameState?.phase;
  const dayCount = gameState?.dayCount;
  const players = gameState?.players || [];

  return (
    <GameContext.Provider
      value={{
        gameState,
        chatLogs,
        myPlayer,
        phase,
        dayCount,
        players,
        seerVisions,
        nightActionPrompt,
        setNightActionPrompt,
        votingResult,
        setVotingResult,
        nightStatus,
        hunterPrompt,
        setHunterPrompt,
        hunterShotResult,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
