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
import { createGameActor, getGameData, destroyGameActor } from '../engine/gameStateManager.ts';
import { addMessage } from './chatManager.ts';
import { castVote, getVoteTally } from './voteManager.ts';
import type { SlimPlayer, ChatLogs } from '../types/game.ts';

export type SocketCallback = (res: { success: boolean; error?: string; [key: string]: unknown }) => void;

/**
 * Helper function xử lý reconnect của người chơi
 */
const handlePlayerReconnect = (
  io: Server,
  socket: Socket,
  roomId: string,
  playerName: string,
  callback?: SocketCallback,
): boolean => {
  const room = getRoom(roomId);
  const gameData = getGameData(roomId);
  const playerId = socket.id;

  if (room && gameData) {
    const existingPlayer = room.players.find((p) => p.name === playerName);
    if (existingPlayer) {
      if (gameData.disconnectTimers[existingPlayer.id]) {
        clearTimeout(gameData.disconnectTimers[existingPlayer.id]);
        delete gameData.disconnectTimers[existingPlayer.id];
      }

      const oldId = existingPlayer.id;
      existingPlayer.id = playerId;

      if (room.hostId === oldId) {
        room.hostId = playerId;
      }

      const mPlayer = gameData.actor.getSnapshot().context.players.find((p) => p.name === playerName);
      if (mPlayer) mPlayer.id = playerId;

      socket.join(roomId);

      io.to(roomId).emit('ROOM_UPDATED', room);

      const myVisions = gameData.seerVisions?.[playerId] || [];
      socket.emit('RECONNECT_SUCCESS', {
        room,
        gameState: gameData.actor.getSnapshot().context,
        chatLogs: gameData.chatLogs,
        seerVisions: myVisions,
      });

      // Gửi prompt ban đêm nếu đang đến lượt
      const snapshot = gameData.actor.getSnapshot();
      const context = snapshot.context;
      if (snapshot.value === 'NightPhase' && gameData.pendingNightRoles) {
        const currentRole = gameData.pendingNightRoles[gameData.currentNightRoleIndex || 0];
        if (mPlayer && currentRole === mPlayer.role) {
          const alivePlayers = snapshot.context.players.filter((p) => p.isAlive);
          socket.emit('NIGHT_ACTION_PROMPT', {
            role: currentRole,
            targetablePlayers: alivePlayers.map((p) => ({
              id: p.id,
              name: p.name,
              isAlive: p.isAlive,
            })),
            excludeTargetId: currentRole === 'BODYGUARD' ? gameData.lastProtectedId : null,
          });
        }
      }

      // Gửi prompt Hunter trả thù nếu là Hunter đã chết
      if (snapshot.value === 'HunterRetaliation') {
        const isNightDeath = context.hunterNextPhase === 'dayStart';
        const hunter = isNightDeath
          ? context.nightDeaths.find((d) => d.role === 'HUNTER')
          : context.dayDeath?.role === 'HUNTER'
            ? context.dayDeath
            : null;

        if (hunter && hunter.id === playerId) {
          socket.emit('HUNTER_RETALIATION_PROMPT', {
            targetablePlayers: context.players
              .filter((p) => p.isAlive && p.id !== hunter.id)
              .map((p) => ({
                id: p.id,
                name: p.name,
              })),
          });
        }
      }

      if (callback) callback({ success: true, room });
      return true;
    }
  }
  return false;
};

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
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const player = { id: playerId, name: playerName, isHost: true, isAlive: true };
    const room = createRoom(roomId, playerId);

    joinRoom(roomId, player);
    socket.join(roomId);

    io.emit('ROOM_LIST', getRooms());
    if (callback) callback({ success: true, room });
  });

  socket.on(
    'JOIN_ROOM',
    ({ roomId, playerName }: { roomId: string; playerName: string }, callback?: SocketCallback) => {
      const room = getRoom(roomId);
      if (!room) {
        if (callback) callback({ success: false, error: 'Phòng không tồn tại' });
        return;
      }

      if (room.status === 'InGame') {
        const reconnected = handlePlayerReconnect(io, socket, roomId, playerName, callback);
        if (!reconnected) {
          if (callback) callback({ success: false, error: 'Phòng đã bắt đầu chơi và không khớp người chơi cũ' });
        }
        return;
      }

      const player = { id: playerId, name: playerName, isHost: false, isAlive: true };
      const updatedRoom = joinRoom(roomId, player);
      if (updatedRoom) {
        socket.join(roomId);
        io.to(roomId).emit('ROOM_UPDATED', updatedRoom);
      }
      io.emit('ROOM_LIST', getRooms());

      if (callback) callback({ success: true, room: updatedRoom || room });
    },
  );

  socket.on('UPDATE_SETTINGS', ({ roomId, settings }: { roomId: string; settings: Record<string, unknown> }) => {
    const room = getRoom(roomId);
    if (room && room.hostId === playerId) {
      const updatedRoom = updateRoomSettings(roomId, settings);
      io.to(roomId).emit('ROOM_UPDATED', updatedRoom);
    }
  });

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
      actor.send({ type: 'START_GAME', players: room.players, settings: room.settings });

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

      if (isHost || isGameOver) {
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

  socket.on('SEND_CHAT', ({ roomId, channel, content }: { roomId: string; channel: string; content: string }) => {
    const gameData = getGameData(roomId);
    if (!gameData) return;
    const { context } = gameData.actor.getSnapshot();
    const player = context.players.find((p) => p.id === playerId);
    if (!player) return;

    // Phân quyền chat theo Phase
    if (channel === 'general' && context.phase !== 'dayDiscuss' && context.phase !== 'voting') return;
    if (channel === 'wolves' && (context.phase !== 'night' || player.role !== 'WEREWOLF')) return;
    if (channel === 'ghost' && player.isAlive) return;

    const message = {
      id: Date.now().toString(),
      senderId: playerId,
      senderName: player.name,
      channel,
      content,
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
            else if (channel === 'wolves') canView = targetPlayer.role === 'WEREWOLF';

            if (canView) {
              s.emit('CHAT_MESSAGE', message);
            }
          });
        });
    }
  });

  socket.on('CAST_VOTE', ({ roomId, targetId }: { roomId: string; targetId: string }) => {
    if (castVote(roomId, playerId, targetId)) {
      const { tally, totalVoters } = getVoteTally(roomId);
      io.to(roomId).emit('VOTE_UPDATED', { tally, totalVoters });

      const gameData = getGameData(roomId);
      if (gameData) {
        const votedCount = Object.keys(gameData.votes).length;
        if (votedCount >= totalVoters) {
          import('../engine/gameStateManager.ts').then(({ clearGameTimer }) => {
            clearGameTimer(roomId);
          });

          import('./voteManager.ts').then(({ resolveVote }) => {
            const eliminatedId = resolveVote(roomId);
            const context = gameData.actor.getSnapshot().context;

            let eliminatedPlayer: SlimPlayer | null = null;
            if (eliminatedId) {
              const p = context.players.find((x) => x.id === eliminatedId);
              if (p) {
                eliminatedPlayer = { id: p.id, name: p.name, role: p.role };
              }
            }

            io.to(roomId).emit('VOTING_RESULT', {
              eliminatedPlayer,
              isTie: !eliminatedId,
            });

            setTimeout(() => {
              gameData.actor.send({
                type: 'VOTING_DONE',
                eliminatedPlayer,
              });
            }, 4000);
          });
        }
      }
    }
  });

  socket.on('NIGHT_ACTION', ({ roomId, targetId }: { roomId: string; targetId: string }) => {
    import('./nightManager.ts').then(({ submitNightAction }) => {
      submitNightAction(roomId, playerId, targetId, io);
    });
  });

  socket.on('HUNTER_SHOOT', ({ roomId, targetId }: { roomId: string; targetId: string }) => {
    const gameData = getGameData(roomId);
    if (!gameData) return;

    const snapshot = gameData.actor.getSnapshot();
    const context = snapshot.context;

    if (snapshot.value !== 'HunterRetaliation') return;

    const isNightDeath = context.hunterNextPhase === 'dayStart';
    const hunter = isNightDeath
      ? context.nightDeaths.find((d) => d.role === 'HUNTER')
      : context.dayDeath?.role === 'HUNTER'
        ? context.dayDeath
        : null;

    if (!hunter || hunter.id !== playerId) return;

    const target = context.players.find((p) => p.id === targetId && p.isAlive);
    if (!target) return;

    import('../engine/gameStateManager.ts').then(({ clearGameTimer }) => {
      clearGameTimer(roomId);
    });

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
    }, 4000);
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
