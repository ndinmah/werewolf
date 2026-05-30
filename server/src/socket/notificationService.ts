import type { Server } from 'socket.io';
import type { GameContext } from '../types/game.ts';
import { SOCKET_EVENTS } from '../constants/events.ts';
import { getGameData } from '../engine/gameStateManager.ts';
import { addMessage } from './chatManager.ts';
import { isPlayerWerewolf } from '../engine/gameHelpers.ts';

/**
 * Gửi cập nhật trạng thái game được cá nhân hóa đến từng người chơi trong phòng
 * (Giải quyết vấn đề S1)
 */
export const notifyPlayers = (roomId: string, context: GameContext, io: Server): void => {
  if (!io) return;

  const gameData = getGameData(roomId);

  // Phát hiện và thông báo ngay lập tức nếu Lời nguyền Già làng kích hoạt
  if (context.villagersLostPowers) {
    if (gameData && !gameData.curseNotified) {
      gameData.curseNotified = true;

      // Phát sự kiện khẩn cấp cho cả phòng
      io.to(roomId).emit('ELDER_CURSE_ACTIVATED');

      // Gửi tin nhắn hệ thống vào kênh chat chung
      const systemMessage = {
        id: `sys-${Date.now()}`,
        senderId: 'SYSTEM',
        senderName: 'Trọng Tài',
        channel: 'general',
        content: '⚠️ LỜI NGUYỀN GIÀ LÀNG: Già làng đã bị chết do sự ngu ngốc của dân làng! Lời nguyền trỗi dậy, toàn bộ dân làng có chức năng đặc biệt đã mất đi kỹ năng.',
        timestamp: new Date().toISOString()
      };
      addMessage(roomId, 'general', systemMessage);
      io.to(roomId).emit('CHAT_MESSAGE', systemMessage);
    }
  }

  io.to(roomId).fetchSockets().then(sockets => {
    sockets.forEach(s => {
      const myPlayer = context.players.find(p => p.id === s.id);
      const nightActions = gameData?.nightActions;

      const personalizedPlayers = context.players.map(p => {
        const isSelf = p.id === s.id;
        const isDead = !p.isAlive;
        
        const myPlayerIsWolf = isPlayerWerewolf(myPlayer, nightActions);
        const pIsWolf = isPlayerWerewolf(p, nightActions);
        const isWolfTeam = myPlayerIsWolf && pIsWolf;
        
        const isGameOver = context.phase === 'gameOver';

        const isLoverOfCurrentUser = context.lovers &&
          context.lovers.length === 2 &&
          context.lovers.includes(s.id) &&
          context.lovers.includes(p.id);

        // Chỉ hiển thị role và faction của bản thân, người đã chết, đồng bọn sối hoặc khi kết thúc game
        if (isSelf || isDead || isWolfTeam || isGameOver) {
          let finalRole = p.role;
          let finalFaction = p.faction;
          if (pIsWolf && p.role === 'CURSED') {
            finalRole = 'WEREWOLF';
            finalFaction = 'WEREWOLF';
          }
          return {
            ...p,
            role: finalRole,
            faction: finalFaction,
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
        timerStartAt: context.timerStartAt,
        elderShields: myPlayer?.role === 'ELDER' ? context.elderShields : undefined,
        villagersLostPowers: context.villagersLostPowers,
        doppelgangerTargetId: myPlayer?.role === 'DOPPELGANGER' ? context.doppelgangerTargets?.[s.id] : undefined,
      });
    });
  });
};
