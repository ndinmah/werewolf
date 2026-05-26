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
  | 'lobby'
  | 'roleReveal'
  | 'firstNight'
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
  winner?: 'WEREWOLF' | 'VILLAGER' | 'THIRD_PARTY' | null;
  nightDeaths?: Player[];
  dayDeath?: Player | null;
  timerDuration?: number;
  timerStartAt?: number;
  hunterNextPhase?: string;
}

export interface ChatMessage {
  id: string;
  channel: 'general' | 'wolves' | 'ghost';
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number | string;
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

export interface WitchInfo {
  werewolfVictimId: string | null;
  canHeal: boolean;
  canPoison: boolean;
}

export interface NightActionPrompt {
  role: Role;
  targetablePlayers: Pick<Player, 'id' | 'name' | 'isAlive'>[];
  excludeTargetId?: string | null;
  /** Thông tin đặc biệt dành cho WITCH */
  witchInfo?: WitchInfo;
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

export interface WolfRevealInfo {
  teammates: Pick<Player, 'id' | 'name'>[];
}

export interface LoverRevealInfo {
  partner: Pick<Player, 'id' | 'name'> | null;
}

export interface CupidPrompt {
  targetablePlayers: Pick<Player, 'id' | 'name'>[];
}

