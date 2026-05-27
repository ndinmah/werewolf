import type { Server, Socket } from 'socket.io';
import type { GameContext, Player, Role, NightActionPayload } from '../types/game.ts';
import type { GameData } from '../engine/gameStateManager.ts';

export interface RoleHandler {
  /**
   * Được gọi lúc bắt đầu Đêm Đầu Tiên (dành cho các vai trò như Cupid hoặc Ma Sói hành động/tiết lộ).
   * @param roomId ID phòng game
   * @param context Context game hiện tại
   * @param gameData State dữ liệu game hiện tại
   * @param io Thực thể server socket.io
   */
  onFirstNightStart?(roomId: string, context: GameContext, gameData: GameData, io: Server): void;

  /**
   * Được gọi khi đến lượt của vai trò này trong Đêm.
   * Nhắc nhở người chơi tương ứng thực hiện hành động.
   * @param roomId ID phòng game
   * @param player Thực thể người chơi có vai trò này
   * @param context Context game hiện tại
   * @param gameData State dữ liệu game hiện tại
   * @param socket Thực thể socket của người chơi
   */
  promptNightAction?(roomId: string, player: Player, context: GameContext, gameData: GameData, socket: Socket): void;

  /**
   * Được gọi khi một người chơi có vai trò này gửi hành động.
   * @param roomId ID phòng game
   * @param player Thực thể người chơi hành động
   * @param payload Payload chứa targetId hoặc các tham số hành động khác
   * @param context Context game hiện tại
   * @param gameData State dữ liệu game hiện tại
   * @param io Thực thể server socket.io
   * @returns boolean trả về true nếu hành động xử lý thành công và lượt chơi nên chuyển tiếp
   */
  submitNightAction?(
    roomId: string,
    player: Player,
    payload: NightActionPayload,
    context: GameContext,
    gameData: GameData,
    io: Server
  ): boolean;

  /**
   * Được gọi sau khi tất cả hành động ban đêm được gửi để tính toán kết quả ban đêm.
   * @param roomId ID phòng game
   * @param context Context game hiện tại
   * @param gameData State dữ liệu game hiện tại
   * @param deaths Tập hợp ID người chơi dự kiến sẽ chết đêm nay. Các handler có thể thêm hoặc bớt ID.
   * @param io Thực thể server socket.io
   */
  resolveNight?(roomId: string, context: GameContext, gameData: GameData, deaths: Set<string>, io: Server): void;

  /**
   * Được gọi khi một người chơi có vai trò này chết.
   * @param roomId ID phòng game
   * @param deadPlayer Người chơi đã chết
   * @param context Context game hiện tại
   * @param cause Nguyên nhân chết ('night', 'vote', 'hunter')
   * @returns Trả về một phần context cập nhật (Partial<GameContext>) hoặc void
   */
  onDeath?(roomId: string, deadPlayer: Player, context: GameContext, cause: string): Partial<GameContext> | void;
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
