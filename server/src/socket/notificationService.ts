import type { Server } from 'socket.io';
import type { GameContext } from '../types/game.ts';
import { SOCKET_EVENTS } from '../constants/events.ts';

/**
 * Gửi cập nhật trạng thái game được cá nhân hóa đến từng người chơi trong phòng
 * (Giải quyết vấn đề S1)
 */
export const notifyPlayers = (roomId: string, context: GameContext, io: Server): void => {
  if (!io) return;

  io.to(roomId).fetchSockets().then(sockets => {
    sockets.forEach(s => {
      const myPlayer = context.players.find(p => p.id === s.id);

      const personalizedPlayers = context.players.map(p => {
        const isSelf = p.id === s.id;
        const isDead = !p.isAlive;
        const isWolfTeam = myPlayer?.role === 'WEREWOLF' && p.role === 'WEREWOLF';
        const isGameOver = context.phase === 'gameOver';

        const isLoverOfCurrentUser = context.lovers &&
          context.lovers.length === 2 &&
          context.lovers.includes(s.id) &&
          context.lovers.includes(p.id);

        // Chỉ hiển thị role và faction của bản thân, người đã chết, đồng bọn sói hoặc khi kết thúc game
        if (isSelf || isDead || isWolfTeam || isGameOver) {
          return {
            ...p,
            isLover: isLoverOfCurrentUser ? true : undefined
          };
        }
        return {
          ...p,
          role: undefined,
          faction: undefined,
          isLover: isLoverOfCurrentUser ? true : undefined
        };
      });

      s.emit(SOCKET_EVENTS.GAME_STATE_UPDATE, {
        phase: context.phase,
        dayCount: context.dayCount,
        players: personalizedPlayers,
        nightDeaths: context.nightDeaths,
        dayDeath: context.dayDeath,
        winner: context.winner,
        timerDuration: context.timerDuration,
        timerStartAt: context.timerStartAt
      });
    });
  });
};
