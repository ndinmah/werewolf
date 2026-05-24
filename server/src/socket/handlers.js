import { createRoom, joinRoom, leaveRoom, getRoom, getRooms, updateRoomSettings } from './roomManager.js';

export const setupHandlers = (io, socket) => {
  // Lấy ID người chơi (có thể dùng socket.id tạm thời)
  const playerId = socket.id;

  // Lấy danh sách phòng
  socket.on('GET_ROOMS', () => {
    socket.emit('ROOM_LIST', getRooms());
  });

  // Tạo phòng
  socket.on('CREATE_ROOM', ({ playerName }, callback) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const player = { id: playerId, name: playerName, isHost: true };
    const room = createRoom(roomId, playerId);
    
    joinRoom(roomId, player);
    socket.join(roomId);
    
    io.emit('ROOM_LIST', getRooms()); // Cập nhật cho mọi người
    
    if (callback) callback({ success: true, room });
  });

  // Tham gia phòng
  socket.on('JOIN_ROOM', ({ roomId, playerName }, callback) => {
    const room = getRoom(roomId);
    if (!room) {
      if (callback) callback({ success: false, error: 'Phòng không tồn tại' });
      return;
    }

    const player = { id: playerId, name: playerName, isHost: false };
    const updatedRoom = joinRoom(roomId, player);
    
    socket.join(roomId);
    
    // Báo cho mọi người trong phòng
    io.to(roomId).emit('ROOM_UPDATED', updatedRoom);
    // Báo ra sảnh
    io.emit('ROOM_LIST', getRooms());

    if (callback) callback({ success: true, room: updatedRoom });
  });

  // Cập nhật settings (chỉ Host)
  socket.on('UPDATE_SETTINGS', ({ roomId, settings }) => {
    const room = getRoom(roomId);
    if (room && room.hostId === playerId) {
      const updatedRoom = updateRoomSettings(roomId, settings);
      io.to(roomId).emit('ROOM_UPDATED', updatedRoom);
    }
  });

  // Bắt sự kiện ngắt kết nối
  socket.on('disconnect', () => {
    // Phải quét qua các phòng xem người này ở phòng nào để xóa
    const rooms = getRooms();
    rooms.forEach(r => {
      if (r.players.find(p => p.id === playerId)) {
        const updatedRoom = leaveRoom(r.id, playerId);
        if (updatedRoom) {
          io.to(r.id).emit('ROOM_UPDATED', updatedRoom);
        }
        io.emit('ROOM_LIST', getRooms());
      }
    });
  });
};
