import type { Server, Socket } from 'socket.io';
import type { GameContext, Player, Role } from '../types/game.ts';
import type { GameData } from '../engine/gameStateManager.ts';

export interface RoleHandler {
  /**
   * Called at the start of the First Night (for roles like Cupid or Werewolves to act/reveal).
   * @param roomId The game room ID
   * @param context The current game context
   * @param gameData The current game data state
   * @param io The socket.io server instance
   */
  onFirstNightStart?(roomId: string, context: GameContext, gameData: GameData, io: Server): void;

  /**
   * Called when it's this role's turn during the Night Phase.
   * Prompts the relevant players to take their actions.
   * @param roomId The game room ID
   * @param player The player instance who has this role
   * @param context The current game context
   * @param gameData The current game data state
   * @param socket The socket instance of the player
   */
  promptNightAction?(roomId: string, player: Player, context: GameContext, gameData: GameData, socket: Socket): void;

  /**
   * Called when a player with this role submits an action.
   * @param roomId The game room ID
   * @param player The player instance acting
   * @param targetId The selected target ID (if any)
   * @param context The current game context
   * @param gameData The current game data state
   * @param io The socket.io server instance
   * @param extraData Any extra data sent from the client (like poisonTargetId)
   * @returns boolean true if the action was successfully processed and the turn should advance
   */
  submitNightAction?(
    roomId: string,
    player: Player,
    targetId: string | null,
    context: GameContext,
    gameData: GameData,
    io: Server,
    extraData?: unknown
  ): boolean;

  /**
   * Called after all night actions are submitted to resolve the night's outcome.
   * @param roomId The game room ID
   * @param context The current game context
   * @param gameData The current game data state
   * @param deaths A Set of player IDs who are scheduled to die tonight. Handlers can add or remove IDs.
   * @param io The socket.io server instance
   */
  resolveNight?(roomId: string, context: GameContext, gameData: GameData, deaths: Set<string>, io: Server): void;

  /**
   * Called when a player with this role dies.
   * @param roomId The game room ID
   * @param deadPlayer The player who died
   * @param context The current game context
   * @param gameData The current game data state
   * @param cause The phase or reason they died ('night', 'vote', 'hunter')
   */
  onDeath?(roomId: string, deadPlayer: Player, context: GameContext, gameData: GameData, cause: string): void;
}

class RoleRegistryClass {
  private handlers: Map<Role, RoleHandler> = new Map();

  register(role: Role, handler: RoleHandler) {
    this.handlers.set(role, handler);
  }

  getHandler(role: Role): RoleHandler | undefined {
    return this.handlers.get(role);
  }

  getAllHandlers(): [Role, RoleHandler][] {
    return Array.from(this.handlers.entries());
  }
}

export const RoleRegistry = new RoleRegistryClass();
