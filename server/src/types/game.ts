// =============================================
// Shared Server Types for Werewolf Game
// =============================================

export type Role =
  | 'VILLAGER'
  | 'WEREWOLF'
  | 'SEER'
  | 'BODYGUARD'
  | 'HUNTER'
  | 'WITCH'
  | 'CUPID';

export type Faction = 'VILLAGER' | 'WEREWOLF' | 'THIRD_PARTY';

export type GamePhase =
  | 'lobby'
  | 'roleReveal'
  | 'firstNight'
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
  /** Phù thủy đã dùng quyền hồi sinh chưa */
  witchHeals: boolean;
  /** Phù thủy đã dùng quyền đầu độc chưa */
  witchPoisons: boolean;
  /** Danh sách 2 người được chọn làm người tình (Cupid) */
  lovers: string[];
  /** Cờ báo hiệu có người chơi cần trả đũa (ví dụ: Thợ săn) */
  pendingRetaliation?: boolean;
  pendingRetaliationHunterId?: string | null;
  /** Danh sách ID người chơi vừa mới chết trong transition hiện tại */
  newlyDeadPlayerIds?: string[];
}

export interface GameEvent {
  type: string;
  players?: Player[];
  settings?: RoomSettings;
  nightDeaths?: Player[];
  eliminatedPlayer?: SlimPlayer | null;
  shotPlayerId?: string;
  /** Event PLAYER_RECONNECTED: cập nhật socket id mới cho player */
  oldId?: string;
  newId?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  channel: string;
  content: string;
  timestamp: string;
}

export interface ChatLogs {
  general: ChatMessage[];
  wolves: ChatMessage[];
  ghost: ChatMessage[];
}

export interface SeerVision {
  targetId: string;
  targetName: string;
  isWerewolf: boolean;
}

export type NightActionPayload =
  | { role: 'WEREWOLF'; targetId: string }
  | { role: 'SEER'; targetId: string }
  | { role: 'BODYGUARD'; targetId: string }
  | { role: 'WITCH'; healTargetId: string | null; poisonTargetId: string | null }
  | { role: 'CUPID'; lover1Id: string; lover2Id: string };

export type NightActionInput = Partial<{
  targetId: string;
  healTargetId: string | null;
  poisonTargetId: string | null;
  lover1Id: string;
  lover2Id: string;
}>;


