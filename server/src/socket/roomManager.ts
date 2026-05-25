// In-memory store cho cÃ¡c phÃ²ng
const rooms = new Map();

/**
 * Láº¥y danh sÃ¡ch táº¥t cáº£ cÃ¡c phÃ²ng
 */
export const getRooms = () => {
  return Array.from(rooms.values());
};

/**
 * TÃ¬m phÃ²ng theo ID
 */
export const getRoom = (roomId) => {
  return rooms.get(roomId);
};

/**
 * Táº¡o phÃ²ng má»›i
 */
export const createRoom = (roomId, hostId) => {
  const newRoom = {
    id: roomId,
    hostId: hostId,
    players: [], // Danh sÃ¡ch ngÆ°á»i chÆ¡i
    status: 'Lobby',
    settings: {
      turnDuration: 60,
      roles: [], // CÃ¡c role Ä‘Æ°á»£c chá»n trong phÃ²ng
    },
  };
  rooms.set(roomId, newRoom);
  return newRoom;
};

/**
 * XÃ³a phÃ²ng
 */
export const deleteRoom = (roomId) => {
  rooms.delete(roomId);
};

/**
 * ThÃªm ngÆ°á»i chÆ¡i vÃ o phÃ²ng
 */
export const joinRoom = (roomId, player) => {
  const room = rooms.get(roomId);
  if (room) {
    // TrÃ¡nh trÃ¹ng láº·p
    if (!room.players.find((p) => p.id === player.id)) {
      room.players.push(player);
    }
    return room;
  }
  return null;
};

/**
 * XÃ³a ngÆ°á»i chÆ¡i khá»i phÃ²ng
 */
export const leaveRoom = (roomId, playerId) => {
  const room = rooms.get(roomId);
  if (room) {
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length === 0) {
      // Náº¿u phÃ²ng trá»‘ng, xÃ³a phÃ²ng luÃ´n
      deleteRoom(roomId);
      return null;
    }
    // Náº¿u host thoÃ¡t, chuyá»ƒn host cho ngÆ°á»i Ä‘áº§u tiÃªn
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

export const updateRoomStatus = (roomId, status) => {
  const room = rooms.get(roomId);
  if (room) {
    room.status = status;
    return room;
  }
  return null;
};
