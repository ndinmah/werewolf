// In-memory store cho các phòng
const rooms = new Map();

/**
 * Lấy danh sách tất cả các phòng
 */
export const getRooms = () => {
  return Array.from(rooms.values());
};

/**
 * Tìm phòng theo ID
 */
export const getRoom = (roomId) => {
  return rooms.get(roomId);
};

/**
 * Tạo phòng mới
 */
export const createRoom = (roomId, hostId) => {
  const newRoom = {
    id: roomId,
    hostId: hostId,
    players: [], // Danh sách người chơi
    status: 'Lobby',
    settings: {
      turnDuration: 60,
      roles: [], // Các role được chọn trong phòng
    },
  };
  rooms.set(roomId, newRoom);
  return newRoom;
};

/**
 * Xóa phòng
 */
export const deleteRoom = (roomId) => {
  rooms.delete(roomId);
};

/**
 * Thêm người chơi vào phòng
 */
export const joinRoom = (roomId, player) => {
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
export const leaveRoom = (roomId, playerId) => {
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

export const updateRoomSettings = (roomId, settings) => {
  const room = rooms.get(roomId);
  if (room) {
    room.settings = { ...room.settings, ...settings };
    return room;
  }
  return null;
};
