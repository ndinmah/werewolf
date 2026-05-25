// =============================================
// Shared Server Types for Werewolf Game
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

export type Faction = 'VILLAGER' | 'WEREWOLF' | 'THIRD_PARTY';

export type GamePhase =
  | 'lobby'
  | 'night'
  | 'dayStart'
  | 'dayDiscuss'
  | 'voting'
  | 'hunterRetaliation'
  | 'gameOver';

export interface Player {
  id: string;
  name: string;
  role?: Role;
  faction?: Faction;
  isAlive: boolean;
  disconnected?: boolean;
}

export interface SlimPlayer {
  id: string;
  name: string;
  role?: Role;
}

export interface RoomSettings {
  roles: Role[];
  discussionTime?: number;
  voteTime?: number;
  dayStartDuration?: number;
  [key: string]: unknown;
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  status: 'Lobby' | 'InGame';
  settings: RoomSettings;
}

export interface GameContext {
  players: Player[];
  phase: GamePhase;
  dayCount: number;
  nightDeaths: Player[];
  voteTally: Record<string, string>;
  settings: RoomSettings;
  timerDuration: number | null;
  timerStartAt: number | null;
  winner: Faction | null;
  dayDeath: SlimPlayer | null;
  hunterNextPhase: string | null;
  hunterShotPlayer: SlimPlayer | null;
}

export interface GameEvent {
  type: string;
  players?: Player[];
  settings?: RoomSettings;
  nightDeaths?: Player[];
  eliminatedPlayer?: SlimPlayer | null;
  shotPlayerId?: string;
  [key: string]: unknown;
}
