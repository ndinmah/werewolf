import { createRoom, joinRoom, leaveRoom, getRoom, getRooms, updateRoomSettings, updateRoomStatus } from './roomManager.js';
import { createGameActor, getGameData, destroyGameActor } from '../engine/gameStateManager.js';
import { addMessage } from './chatManager.js';
import { castVote, getVoteTally } from './voteManager.js';

export const setupHandlers = (io, socket) => {
  const playerId = socket.id;

  socket.on('GET_ROOMS', () => {
    socket.emit('ROOM_LIST', getRooms());
  });

  socket.on('GET_ROOM', ({ roomId }, callback) => {
    const room = getRoom(roomId);
    if (room) {
      if (callback) callback({ success: true, room });
    } else {
      if (callback) callback({ success: false, error: 'Phòng không tồn tại' });
    }
  });

  socket.on('CREATE_ROOM', ({ playerName }, callback) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const player = { id: playerId, name: playerName, isHost: true };
    const room = createRoom(roomId, playerId);
    
    joinRoom(roomId, player);
    socket.join(roomId);
    
    io.emit('ROOM_LIST', getRooms());
    if (callback) callback({ success: true, room });
  });

  socket.on('JOIN_ROOM', ({ roomId, playerName }, callback) => {
    const room = getRoom(roomId);
    if (!room) {
      if (callback) callback({ success: false, error: 'Phòng không tồn tại' });
      return;
    }

    if (room.status === 'InGame') {
      if (callback) callback({ success: false, error: 'Phòng đã bắt đầu chơi' });
      return;
    }

    const player = { id: playerId, name: playerName, isHost: false };
    const updatedRoom = joinRoom(roomId, player);
    
    socket.join(roomId);
    
    io.to(roomId).emit('ROOM_UPDATED', updatedRoom);
    io.emit('ROOM_LIST', getRooms());

    if (callback) callback({ success: true, room: updatedRoom });
  });

  socket.on('UPDATE_SETTINGS', ({ roomId, settings }) => {
    const room = getRoom(roomId);
    if (room && room.hostId === playerId) {
      const updatedRoom = updateRoomSettings(roomId, settings);
      io.to(roomId).emit('ROOM_UPDATED', updatedRoom);
    }
  });

  socket.on('START_GAME', ({ roomId }) => {
    const room = getRoom(roomId);
    if (room && room.hostId === playerId && room.status === 'Lobby') {
      updateRoomStatus(roomId, 'InGame');
      
      const actor = createGameActor(roomId, io);
      actor.send({ type: 'START_GAME', players: room.players });
      
      io.to(roomId).emit('ROOM_UPDATED', getRoom(roomId));
      io.emit('ROOM_LIST', getRooms());
    }
  });

  socket.on('SEND_CHAT', ({ roomId, channel, content }) => {
    const gameData = getGameData(roomId);
    if (!gameData) return;
    const { context } = gameData.actor.getSnapshot();
    const player = context.players.find(p => p.id === playerId);
    if (!player) return;

    if (channel === 'wolves' && player.role !== 'werewolf') return;
    if (channel === 'ghost' && player.isAlive) return;
    
    const message = {
      id: Date.now().toString(),
      senderId: playerId,
      senderName: player.name,
      channel,
      content,
      timestamp: new Date().toISOString()
    };

    if (addMessage(roomId, channel, message)) {
      io.to(roomId).fetchSockets().then(sockets => {
        sockets.forEach(s => {
          const targetPlayer = context.players.find(p => p.id === s.id);
          if (!targetPlayer) return;

          let canView = false;
          if (channel === 'general') canView = true;
          else if (channel === 'ghost') canView = !targetPlayer.isAlive;
          else if (channel === 'wolves') canView = targetPlayer.role === 'werewolf';

          if (canView) {
            s.emit('CHAT_MESSAGE', message);
          }
        });
      });
    }
  });

  socket.on('CAST_VOTE', ({ roomId, targetId }) => {
    if (castVote(roomId, playerId, targetId)) {
      const { tally, totalVoters } = getVoteTally(roomId);
      io.to(roomId).emit('VOTE_UPDATED', { tally, totalVoters });
    }
  });

  socket.on('RECONNECT_ROOM', ({ roomId, playerName }, callback) => {
    const room = getRoom(roomId);
    const gameData = getGameData(roomId);
    
    if (room && gameData) {
      const player = room.players.find(p => p.name === playerName);
      if (player) {
        if (gameData.disconnectTimers[player.id]) {
          clearTimeout(gameData.disconnectTimers[player.id]);
          delete gameData.disconnectTimers[player.id];
        }
        
        // Cập nhật socket id
        const oldId = player.id;
        player.id = playerId;
        
        // Mutation an toàn hơn là gọi event cho machine, nhưng do in-memory đơn giản ta update trực tiếp mảng (vì event truyền tham chiếu objects)
        const mPlayer = gameData.actor.getSnapshot().context.players.find(p => p.name === playerName);
        if (mPlayer) mPlayer.id = playerId;

        socket.join(roomId);
        
        io.to(roomId).emit('ROOM_UPDATED', room);
        socket.emit('RECONNECT_SUCCESS', {
          room,
          gameState: gameData.actor.getSnapshot().context,
          chatLogs: gameData.chatLogs
        });
        
        if (callback) callback({ success: true });
        return;
      }
    }
    if (callback) callback({ success: false });
  });

  socket.on('disconnect', () => {
    const rooms = getRooms();
    rooms.forEach(r => {
      const player = r.players.find(p => p.id === playerId);
      if (player) {
        if (r.status === 'InGame') {
          io.to(r.id).emit('PLAYER_DISCONNECTED', { playerId });
          
          const gameData = getGameData(r.id);
          if (gameData) {
            gameData.disconnectTimers[playerId] = setTimeout(() => {
              const updatedRoom = leaveRoom(r.id, playerId);
              if (updatedRoom) {
                io.to(r.id).emit('ROOM_UPDATED', updatedRoom);
              } else {
                destroyGameActor(r.id);
              }
              io.emit('ROOM_LIST', getRooms());
            }, 30000);
          }
        } else {
          const updatedRoom = leaveRoom(r.id, playerId);
          if (updatedRoom) {
            io.to(r.id).emit('ROOM_UPDATED', updatedRoom);
          }
          io.emit('ROOM_LIST', getRooms());
        }
      }
    });
  });
};
