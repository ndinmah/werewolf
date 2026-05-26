import { getGameData } from '../engine/gameStateManager.ts';
import type { ChatMessage, ChatLogs } from '../types/game.ts';

export const addMessage = (roomId: string, channel: keyof ChatLogs, message: ChatMessage) => {
  const gameData = getGameData(roomId);
  if (gameData && gameData.chatLogs[channel]) {
    gameData.chatLogs[channel].push(message);
    return true;
  }
  return false;
};

export const getMessages = (roomId: string, channel: keyof ChatLogs) => {
  const gameData = getGameData(roomId);
  if (gameData && gameData.chatLogs[channel]) {
    return gameData.chatLogs[channel];
  }
  return [];
};
