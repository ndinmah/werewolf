import { getGameData } from '../engine/gameStateManager.ts';

export const addMessage = (roomId, channel, message) => {
  const gameData = getGameData(roomId);
  if (gameData && gameData.chatLogs[channel]) {
    gameData.chatLogs[channel].push(message);
    return true;
  }
  return false;
};

export const getMessages = (roomId, channel) => {
  const gameData = getGameData(roomId);
  if (gameData && gameData.chatLogs[channel]) {
    return gameData.chatLogs[channel];
  }
  return [];
};
