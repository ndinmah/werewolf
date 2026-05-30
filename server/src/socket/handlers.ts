import type { Server, Socket } from 'socket.io';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom,
  getRooms,
  updateRoomSettings,
  updateRoomStatus,
} from './roomManager.ts';
import { createGameActor, getGameData, destroyGameActor, clearGameTimer } from '../engine/gameStateManager.ts';
import { addMessage } from './chatManager.ts';
import { castVote, getVoteTally, finalizeVoting } from './voteManager.ts';
import { submitNightAction, submitWitchAction, submitCupidAction, handleNightPlayerDisconnect } from './nightManager.ts';
import { findPendingHunter, isPlayerWerewolf } from '../engine/gameHelpers.ts';
import { handlePlayerReconnect } from './reconnectManager.ts';
import type { ChatLogs, NightActionInput } from '../types/game.ts';

export type SocketCallback = (res: { success: boolean; error?: string; [key: string]: unknown }) => void;

/** Validate tên người chơi: 2-20 ký tự, chỉ chứa chữ cái/số/khoảng trắng/gạch dưới */
const validatePlayerName = (name: string): string | null => {
  if (!name || typeof name !== 'string') return 'Tên không được để trống';
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Tên phải có ít nhất 2 ký tự';
  if (trimmed.length > 20) return 'Tên không được vượt quá 20 ký tự';
  if (!/^[\w\s\u00C0-\u024F\u1E00-\u1EFF]+$/u.test(trimmed)) return 'Tên chỉ được chứa chữ cái, số và khoảng trắng';
  return null;
};

/** Validate nội dung tin nhắn chat: không rỗng, độ dài tối đa 200 ký tự */
const validateChatContent = (content: unknown): string | null => {
  if (typeof content !== 'string') return 'Nội dung tin nhắn không hợp lệ';
  const trimmed = content.trim();
  if (trimmed.length === 0) return 'Tin nhắn không được để trống';
  if (trimmed.length > 200) return 'Tin nhắn không được vượt quá 200 ký tự';
  return null;
};

/** Escapes HTML characters để tránh tấn công XSS */
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/** Giới hạn số người chơi tối đa */
const MAX_PLAYERS_PER_ROOM = 15;

export const setupHandlers = (io: Server, socket: Socket): void => {
  const playerId = socket.id;

  // Gửi danh sách phòng ngay khi người chơi kết nối
  socket.emit('ROOM_LIST', getRooms());

  socket.on('GET_ROOMS', () => {
    socket.emit('ROOM_LIST', getRooms());
  });

  socket.on('GET_ROOM', ({ roomId }: { roomId: string }, callback?: SocketCallback) => {
    const room = getRoom(roomId);
    if (room) {
      if (callback) callback({ success: true, room });
    } else {
      if (callback) callback({ success: false, error: 'Phòng không tồn tại' });
    }
  });

  socket.on('CREATE_ROOM', ({ playerName }: { playerName: string }, callback?: SocketCallback) => {
    // Validation
    const nameError = validatePlayerName(playerName);
    if (nameError) {
      if (callback) callback({ success: false, error: nameError });
      return;
    }
    const trimmedName = playerName.trim();
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const player = { id: playerId, name: trimmedName, isHost: true, isAlive: true };
    const room = createRoom(roomId, playerId);

    joinRoom(roomId, player);
    socket.join(roomId);

    io.emit('ROOM_LIST', getRooms());
    if (callback) callback({ success: true, room });
  });

  socket.on(
    'JOIN_ROOM',
    ({ roomId, playerName }: { roomId: string; playerName: string }, callback?: SocketCallback) => {
      // Validate roomId
      if (!roomId || typeof roomId !== 'string' || roomId.trim().length === 0) {
        if (callback) callback({ success: false, error: 'Mã phòng không hợp lệ' });
        return;
      }
      // Validate playerName
      const nameError = validatePlayerName(playerName);
      if (nameError) {
        if (callback) callback({ success: false, error: nameError });
        return;
      }
      const trimmedName = playerName.trim();

      const room = getRoom(roomId);
      if (!room) {
        if (callback) callback({ success: false, error: 'Phòng không tồn tại' });
        return;
      }

      if (room.status === 'InGame') {
        const reconnected = handlePlayerReconnect(io, socket, roomId, trimmedName, callback);
        if (!reconnected) {
          if (callback) callback({ success: false, error: 'Phòng đã bắt đầu chơi và không khớp người chơi cũ' });
        }
        return;
      }

      // Kiểm tra tên trùng
      if (room.players.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
        if (callback) callback({ success: false, error: 'Tên này đã có người dùng trong phòng' });
        return;
      }

      // Kiểm tra số lượng người chơi tối đa
      if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
        if (callback) callback({ success: false, error: `Phòng đã đầy (tối đa ${MAX_PLAYERS_PER_ROOM} người)` });
        return;
      }

      const player = { id: playerId, name: trimmedName, isHost: false, isAlive: true };
      const updatedRoom = joinRoom(roomId, player);
      if (updatedRoom) {
        socket.join(roomId);
        io.to(roomId).emit('ROOM_UPDATED', updatedRoom);
      }
      io.emit('ROOM_LIST', getRooms());

      if (callback) callback({ success: true, room: updatedRoom || room });
    },
  );

  socket.on(
    'UPDATE_SETTINGS',
    ({ roomId, settings }: { roomId: string; settings: Record<string, unknown> }, callback?: SocketCallback) => {
      const room = getRoom(roomId);
      if (!room) {
        if (callback) callback({ success: false, error: 'Phòng không tồn tại' });
        return;
      }
      if (room.hostId !== playerId) {
        if (callback) callback({ success: false, error: 'Chỉ chủ phòng mới có quyền thiết lập' });
        return;
      }
      const updatedRoom = updateRoomSettings(roomId, settings);
      io.to(roomId).emit('ROOM_UPDATED', updatedRoom);
      if (callback) callback({ success: true, room: updatedRoom });
    },
  );

  socket.on('START_GAME', ({ roomId }: { roomId: string }, callback?: SocketCallback) => {
    const room = getRoom(roomId);
    if (room && room.hostId === playerId && room.status === 'Lobby') {
      const roles = room.settings?.roles || [];
      const wolfCount = roles.filter((r) => r === 'WEREWOLF').length;

      if (wolfCount < 1) {
        if (callback) callback({ success: false, error: '⚠️ Trận đấu phải có ít nhất 1 Ma Sói!' });
        return;
      }
      if (room.players.length < 2) {
        if (callback) callback({ success: false, error: '⚠️ Trận đấu phải có ít nhất 2 người chơi!' });
        return;
      }

      updateRoomStatus(roomId, 'InGame');

      const actor = createGameActor(roomId, io);
      actor.send({ type: 'START_GAME', roomId, players: room.players, settings: room.settings });

      io.to(roomId).emit('ROOM_UPDATED', getRoom(roomId));
      io.emit('ROOM_LIST', getRooms());

      if (callback) callback({ success: true });
    }
  });

  socket.on('RESET_ROOM', ({ roomId }: { roomId: string }, callback?: SocketCallback) => {
    const room = getRoom(roomId);
    if (room) {
      const gameData = getGameData(roomId);
      const isGameOver = gameData && gameData.actor.getSnapshot().value === 'GameOver';
      const isHost = room.hostId === playerId;

      if (isGameOver) {
        // Mỗi socket ấn thì tự reset client của socket đó
        socket.emit('GAME_RESET');
        if (callback) callback({ success: true });
      } else if (isHost) {
        // Nếu game chưa kết thúc, chỉ chủ phòng mới được reset toàn bộ phòng chơi
        updateRoomStatus(roomId, 'Lobby');
        destroyGameActor(roomId);

        io.to(roomId).emit('ROOM_UPDATED', room);
        io.to(roomId).emit('GAME_RESET');
        io.emit('ROOM_LIST', getRooms());

        if (callback) callback({ success: true });
      } else {
        if (callback) callback({ success: false, error: 'Chỉ chủ phòng mới có quyền thiết lập lại' });
      }
    } else {
      if (callback) callback({ success: false, error: 'Phòng không tồn tại' });
    }
  });

  socket.on(
    'KICK_PLAYER',
    ({ roomId, targetPlayerId }: { roomId: string; targetPlayerId: string }, callback?: SocketCallback) => {
      const room = getRoom(roomId);
      if (!room) {
        if (callback) callback({ success: false, error: 'Phòng không tồn tại' });
        return;
      }

      if (room.status !== 'Lobby') {
        if (callback) callback({ success: false, error: 'Chỉ có thể kick người chơi khi ở phòng chờ' });
        return;
      }

      if (room.hostId !== playerId) {
        if (callback) callback({ success: false, error: 'Chỉ chủ phòng mới có quyền kick' });
        return;
      }

      if (targetPlayerId === playerId) {
        if (callback) callback({ success: false, error: 'Bạn không thể tự kick chính mình' });
        return;
      }

      const targetSocket = io.sockets.sockets.get(targetPlayerId);
      if (targetSocket) {
        targetSocket.emit('KICKED');
        targetSocket.leave(roomId);
      }

      const updatedRoom = leaveRoom(roomId, targetPlayerId);
      if (updatedRoom) {
        io.to(roomId).emit('ROOM_UPDATED', updatedRoom);
      }
      io.emit('ROOM_LIST', getRooms());

      if (callback) callback({ success: true });
    },
  );

  socket.on(
    'SEND_CHAT',
    ({ roomId, channel, content }: { roomId: string; channel: string; content: string }, callback?: SocketCallback) => {
      const chatError = validateChatContent(content);
      if (chatError) {
        if (callback) callback({ success: false, error: chatError });
        return;
      }
      const sanitizedContent = escapeHtml(content.trim());

      const gameData = getGameData(roomId);
      if (!gameData) {
        if (callback) callback({ success: false, error: 'Phòng chơi không tồn tại' });
        return;
      }
      const { context } = gameData.actor.getSnapshot();
      const player = context.players.find((p) => p.id === playerId);
      if (!player) {
        if (callback) callback({ success: false, error: 'Người chơi không có trong phòng' });
        return;
      }

      // Phân quyền chat theo Phase
      if (channel === 'general' && context.phase !== 'dayDiscuss' && context.phase !== 'voting') {
        if (callback) callback({ success: false, error: 'Không thể chat kênh chung ở phase hiện tại' });
        return;
      }
      if (
        channel === 'wolves' &&
        (!isPlayerWerewolf(player, gameData.nightActions) ||
          !player.isAlive ||
          context.phase === 'roleReveal' ||
          context.phase === 'gameOver')
      ) {
        if (callback) callback({ success: false, error: 'Không có quyền chat kênh Ma Sói' });
        return;
      }
      if (channel === 'ghost' && player.isAlive) {
        if (callback) callback({ success: false, error: 'Chỉ người chết mới được chat kênh này' });
        return;
      }

      const message = {
        id: Date.now().toString(),
        senderId: playerId,
        senderName: player.name,
        channel,
        content: sanitizedContent,
        timestamp: new Date().toISOString(),
      };

      if (addMessage(roomId, channel as keyof ChatLogs, message)) {
        io.to(roomId)
          .fetchSockets()
          .then((sockets) => {
            sockets.forEach((s) => {
              const targetPlayer = context.players.find((p) => p.id === s.id);
              if (!targetPlayer) return;

              let canView = false;
              if (channel === 'general') canView = true;
              else if (channel === 'ghost') canView = !targetPlayer.isAlive;
              else if (channel === 'wolves') canView = isPlayerWerewolf(targetPlayer, gameData.nightActions);

              if (canView) {
                s.emit('CHAT_MESSAGE', message);
              }
            });
          });
        if (callback) callback({ success: true });
      } else {
        if (callback) callback({ success: false, error: 'Không gửi được tin nhắn' });
      }
    },
  );

  socket.on('CAST_VOTE', ({ roomId, targetId }: { roomId: string; targetId: string }, callback?: SocketCallback) => {
    if (!roomId || !targetId) {
      if (callback) callback({ success: false, error: 'Thiếu thông tin phòng hoặc mục tiêu vote' });
      return;
    }

    const gameData = getGameData(roomId);
    if (!gameData) {
      if (callback) callback({ success: false, error: 'Trận đấu không tồn tại' });
      return;
    }

    // Giới hạn tần suất: mỗi người chơi chỉ vote 1 lần mỗi phase
    if (gameData.voteSubmitted.has(playerId)) {
      if (callback) callback({ success: false, error: 'Bạn đã thực hiện vote trong lượt này rồi' });
      return;
    }

    if (castVote(roomId, playerId, targetId)) {
      gameData.voteSubmitted.add(playerId);
      const { tally, totalVoters, votersMap } = getVoteTally(roomId);
      io.to(roomId).emit('VOTE_UPDATED', { tally, totalVoters, votersMap });

      const votedCount = Object.keys(gameData.votes).length;
      if (votedCount >= totalVoters) {
        clearGameTimer(roomId);
        finalizeVoting(roomId, io);
      }
      if (callback) callback({ success: true });
    } else {
      if (callback)
        callback({ success: false, error: 'Vote không thành công (có thể bạn đã chết hoặc mục tiêu không hợp lệ)' });
    }
  });

  socket.on(
    'NIGHT_ACTION',
    (
      { roomId, targetId, ...rest }: { roomId: string; targetId?: string } & NightActionInput,
      callback?: SocketCallback,
    ) => {
      if (!roomId) {
        if (callback) callback({ success: false, error: 'Thiếu mã phòng' });
        return;
      }
      const success = submitNightAction(roomId, playerId, { targetId, ...rest }, io);
      if (success) {
        if (callback) callback({ success: true });
      } else {
        if (callback) callback({ success: false, error: 'Hành động không hợp lệ hoặc không đúng lượt' });
      }
    },
  );

  socket.on('WOLF_DRAFT_TARGET', ({ roomId, targetId }: { roomId: string; targetId: string }) => {
    if (!roomId || typeof targetId !== 'string') return;
    const gameData = getGameData(roomId);
    if (!gameData) return;

    const snapshot = gameData.actor.getSnapshot();
    const context = snapshot.context;
    const player = context.players.find((p) => p.id === playerId);
    if (!player || !player.isAlive || player.role !== 'WEREWOLF') return;

    const wolves = context.players.filter((p) => p.role === 'WEREWOLF' && p.isAlive);
    wolves.forEach((w) => {
      if (w.id !== playerId) {
        const wolfSocket = io.sockets.sockets.get(w.id);
        if (wolfSocket) {
          wolfSocket.emit('WOLF_TARGET_SELECTED', { targetId, actorName: player.name });
        }
      }
    });
  });

  socket.on(
    'WITCH_ACTION',
    (
      {
        roomId,
        healTargetId,
        poisonTargetId,
      }: { roomId: string; healTargetId: string | null; poisonTargetId: string | null },
      callback?: SocketCallback,
    ) => {
      if (!roomId) {
        if (callback) callback({ success: false, error: 'Thiếu mã phòng' });
        return;
      }
      const success = submitWitchAction(roomId, playerId, healTargetId ?? null, poisonTargetId ?? null, io);
      if (success) {
        if (callback) callback({ success: true });
      } else {
        if (callback) callback({ success: false, error: 'Hành động của Phù Thủy không hợp lệ' });
      }
    },
  );

  socket.on(
    'CUPID_ACTION',
    (
      { roomId, lover1Id, lover2Id }: { roomId: string; lover1Id: string; lover2Id: string },
      callback?: SocketCallback,
    ) => {
      if (!roomId || !lover1Id || !lover2Id) {
        if (callback) callback({ success: false, error: 'Thiếu thông tin phòng hoặc cặp đôi' });
        return;
      }
      const success = submitCupidAction(roomId, playerId, lover1Id, lover2Id, io);
      if (success) {
        if (callback) callback({ success: true });
      } else {
        if (callback) callback({ success: false, error: 'Hành động ghép đôi của Cupid không hợp lệ' });
      }
    },
  );

  socket.on('HUNTER_SHOOT', ({ roomId, targetId }: { roomId: string; targetId: string }, callback?: SocketCallback) => {
    const gameData = getGameData(roomId);
    if (!gameData) {
      if (callback) callback({ success: false, error: 'Trận đấu không tồn tại' });
      return;
    }

    const snapshot = gameData.actor.getSnapshot();
    const context = snapshot.context;

    if (snapshot.value !== 'HunterRetaliation') {
      if (callback) callback({ success: false, error: 'Không phải lượt trả thù của Thợ Săn' });
      return;
    }

    const hunter = findPendingHunter(context);
    if (!hunter || hunter.id !== playerId) {
      if (callback) callback({ success: false, error: 'Bạn không phải Thợ Săn có quyền trả thù' });
      return;
    }

    const target = context.players.find((p) => p.id === targetId && p.isAlive);
    if (!target) {
      if (callback) callback({ success: false, error: 'Mục tiêu không hợp lệ hoặc đã chết' });
      return;
    }

    clearGameTimer(roomId);

    io.to(roomId).emit('HUNTER_SHOT_RESULT', {
      hunterName: hunter.name,
      targetName: target.name,
      targetRole: target.role,
    });

    setTimeout(() => {
      gameData.actor.send({
        type: 'HUNTER_SHOT_DONE',
        shotPlayerId: targetId,
      });
    }, 5000);

    if (callback) callback({ success: true });
  });

  // Thợ Săn bỏ qua, không bắn ai
  socket.on('HUNTER_SKIP', ({ roomId }: { roomId: string }, callback?: SocketCallback) => {
    const gameData = getGameData(roomId);
    if (!gameData) {
      if (callback) callback({ success: false, error: 'Trận đấu không tồn tại' });
      return;
    }

    const snapshot = gameData.actor.getSnapshot();
    const context = snapshot.context;

    if (snapshot.value !== 'HunterRetaliation') {
      if (callback) callback({ success: false, error: 'Không phải lượt trả thù của Thợ Săn' });
      return;
    }

    const hunter = findPendingHunter(context);
    if (!hunter || hunter.id !== playerId) {
      if (callback) callback({ success: false, error: 'Bạn không phải Thợ Săn có quyền trả thù' });
      return;
    }

    clearGameTimer(roomId);

    // Bỏ qua: không bắn ai, chuyển phase ngay
    gameData.actor.send({
      type: 'HUNTER_SHOT_DONE',
      shotPlayerId: undefined,
    });

    if (callback) callback({ success: true });
  });

  socket.on(
    'RECONNECT_ROOM',
    ({ roomId, playerName }: { roomId: string; playerName: string }, callback?: SocketCallback) => {
      const reconnected = handlePlayerReconnect(io, socket, roomId, playerName, callback);
      if (!reconnected) {
        if (callback) callback({ success: false });
      }
    },
  );

  socket.on('disconnect', () => {
    const rooms = getRooms();
    rooms.forEach((r) => {
      const player = r.players.find((p) => p.id === playerId);
      if (player) {
        if (r.status === 'InGame') {
          io.to(r.id).emit('PLAYER_DISCONNECTED', { playerId });

          const gameData = getGameData(r.id);
          if (gameData) {
            gameData.actor.send({ type: 'PLAYER_DISCONNECTED', playerId });
            handleNightPlayerDisconnect(r.id, playerId, io);

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
