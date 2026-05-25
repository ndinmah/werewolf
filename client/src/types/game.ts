// =============================================
// Game Types Shared Across Client
// =============================================

export type Role =
  | 'VILLAGER'
  | 'WEREWOLF'
  | 'SEER'
  | 'DOCTOR'
  | 'BODYGUARD'
  | 'HUNTER'
  | 'WITCH'
  | 'CUPID';

export type GamePhase =
  | 'dayStart'
  | 'discussion'
  | 'dayDiscuss'
  | 'voting'
  | 'dayEnd'
  | 'night'
  | 'hunterRetaliation'
  | 'gameOver';

export interface Player {
  id: string;
  name: string;
  role?: Role;
  isAlive: boolean;
  disconnected?: boolean;
  isProtected?: boolean;
  isCursed?: boolean;
  isLover?: boolean;
  votedFor?: string | null;
  faction?: 'WEREWOLF' | 'VILLAGER' | 'THIRD_PARTY';
}

export interface RoomSettings {
  roles: Role[];
  discussionTime?: number;
  votingTime?: number;
  nightTime?: number;
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  status: 'Lobby' | 'InGame';
  settings: RoomSettings;
}

export interface GameState {
  phase: GamePhase;
  dayCount: number;
  players: Player[];
  winner?: 'villagers' | 'werewolves' | null;
  nightDeaths?: Player[];
  dayDeath?: Player | null;
  timerDuration?: number;
  timerStartAt?: number;
  hunterNextPhase?: string;
}

export interface ChatMessage {
  id: string;
  channel: 'general' | 'wolves' | 'ghost';
  playerName: string;
  text: string;
  timestamp: number;
}

export interface ChatLogs {
  general: ChatMessage[];
  wolves: ChatMessage[];
  ghost: ChatMessage[];
}

export interface SeerVision {
  targetName: string;
  targetId: string;
  isWerewolf: boolean;
}

export interface NightActionPrompt {
  role: Role;
  targetablePlayers: Pick<Player, 'id' | 'name' | 'isAlive'>[];
  excludeTargetId?: string | null;
}

export interface HunterPrompt {
  targetablePlayers: Pick<Player, 'id' | 'name'>[];
}

export interface VotingResult {
  eliminated: Player | null;
  votes: Record<string, string>;
  isTie?: boolean;
}

export interface NightStatus {
  waitingFor: string[];
  done: string[];
  currentRoleName?: string;
}

export interface HunterShotResult {
  shooterName: string;
  hunterName: string;
  targetName: string;
  targetRole?: string;
}
