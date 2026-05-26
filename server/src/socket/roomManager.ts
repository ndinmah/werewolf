import type { Player, Room, RoomSettings } from '../types/game';

// In-memory store cho các phòng
const rooms = new Map<string, Room>();

/**
 * Lấy danh sách tất cả các phòng
 */
export const getRooms = (): Room[] => {
  return Array.from(rooms.values()).filter((r) => r.players.length > 0);
};

/**
 * Tìm phòng theo ID
 */
export const getRoom = (roomId: string): Room | undefined => {
  return rooms.get(roomId);
};

/**
 * Tạo phòng mới
 */
export const createRoom = (roomId: string, hostId: string): Room => {
  const newRoom: Room = {
    id: roomId,
    hostId: hostId,
    players: [], // Danh sách người chơi
    status: 'Lobby',
    settings: {
      roles: [], // Các role được chọn trong phòng
      turnDuration: 60,
    },
  };
  rooms.set(roomId, newRoom);
  return newRoom;
};

/**
 * Xóa phòng
 */
export const deleteRoom = (roomId: string): void => {
  rooms.delete(roomId);
};

/**
 * Thêm người chơi vào phòng
 */
export const joinRoom = (roomId: string, player: Player): Room | null => {
  const room = rooms.get(roomId);
  if (room) {
    // Tránh trùng lặp
    if (!room.players.find((p) => p.id === player.id)) {
      room.players.push(player);
    }
    return room;
  }
  return null;
};

/**
 * Xóa người chơi khỏi phòng
 */
export const leaveRoom = (roomId: string, playerId: string): Room | null => {
  const room = rooms.get(roomId);
  if (room) {
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length === 0) {
      // Nếu phòng trống, xóa phòng luôn
      deleteRoom(roomId);
      return null;
    }
    // Nếu host thoát, chuyển host cho người đầu tiên
    if (room.hostId === playerId && room.players.length > 0) {
      room.hostId = room.players[0].id;
    }
    return room;
  }
  return null;
};

export const updateRoomSettings = (roomId: string, settings: Partial<RoomSettings>): Room | null => {
  const room = rooms.get(roomId);
  if (room) {
    room.settings = { ...room.settings, ...settings } as RoomSettings;
    return room;
  }
  return null;
};

export const updateRoomStatus = (roomId: string, status: Room['status']): Room | null => {
  const room = rooms.get(roomId);
  if (room) {
    room.status = status;
    return room;
  }
  return null;
};
