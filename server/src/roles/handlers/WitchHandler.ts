import type { Server, Socket } from 'socket.io';
import type { GameContext, Player, NightActionPayload } from '../../types/game.ts';
import type { GameData } from '../../engine/gameStateManager.ts';
import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';

class WitchHandler implements RoleHandler {
  promptNightAction(_roomId: string, player: Player, context: GameContext, gameData: GameData, socket: Socket): void {
    const alivePlayers = context.players.filter((p) => p.isAlive);
    const hasPowers = !context.villagersLostPowers;

    const werewolfTarget = gameData.nightActions?.['WEREWOLF']?.targetId || null;
    let filteredWerewolfTarget = werewolfTarget;
    if (werewolfTarget) {
      const victim = context.players.find((p) => p.id === werewolfTarget);
      const elderShields = context.elderShields !== undefined ? context.elderShields : 1;
      const bodyguardTarget = gameData.nightActions?.['BODYGUARD']?.targetId || null;
      
      const isElderAndHasShield = victim && victim.role === 'ELDER' && elderShields > 0;
      const isBodyguardProtected = werewolfTarget === bodyguardTarget;
      const isCursed = victim && victim.role === 'CURSED';

      if (isElderAndHasShield || isBodyguardProtected || isCursed) {
        // Nếu mục tiêu sẽ không chết (khiên Già Làng, Bảo Vệ cứu, hoặc Kẻ Bị Nguyền hóa Sói), Phù Thủy không thấy nạn nhân
        filteredWerewolfTarget = null;
      }
    }

    const isSelfBitten = filteredWerewolfTarget === player.id;
    const canHeal = hasPowers && !gameData.witchHealUsed && (!isSelfBitten || context.dayCount === 1);
    const canPoison = hasPowers && !gameData.witchPoisonUsed;

    socket.emit('NIGHT_ACTION_PROMPT', {
      role: 'WITCH',
      targetablePlayers: alivePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        isAlive: p.isAlive,
      })),
      excludeTargetId: null,
      witchInfo: {
        werewolfVictimId: filteredWerewolfTarget,
        canHeal,
        canPoison,
      },
    });
  }

  submitNightAction(
    _roomId: string,
    player: Player,
    payload: NightActionPayload,
    context: GameContext,
    gameData: GameData,
    _io: Server,
  ): boolean {
    if (payload.role !== 'WITCH') return false;
    if (context.villagersLostPowers) return false; // Không có chức năng

    const healTargetId = payload.healTargetId || null;
    const poisonTargetId = payload.poisonTargetId || null;

    if (gameData.nightActionSubmitted.has(player.id)) return false;

    // Kiểm tra tính hợp lệ
    if (healTargetId && gameData.witchHealUsed) return false;
    if (poisonTargetId && gameData.witchPoisonUsed) return false;

    if (healTargetId) {
      const werewolfTarget = gameData.nightActions?.['WEREWOLF']?.targetId || null;
      
      // Hợp lệ hóa mục tiêu cứu
      let filteredWerewolfTarget = werewolfTarget;
      if (werewolfTarget) {
        const victim = context.players.find((p) => p.id === werewolfTarget);
        const elderShields = context.elderShields !== undefined ? context.elderShields : 1;
        const bodyguardTarget = gameData.nightActions?.['BODYGUARD']?.targetId || null;
        
        const isElderAndHasShield = victim && victim.role === 'ELDER' && elderShields > 0;
        const isBodyguardProtected = werewolfTarget === bodyguardTarget;
        const isCursed = victim && victim.role === 'CURSED';

        if (isElderAndHasShield || isBodyguardProtected || isCursed) {
          filteredWerewolfTarget = null;
        }
      }

      if (healTargetId !== filteredWerewolfTarget) return false;
      if (healTargetId === player.id && context.dayCount > 1) return false;
    }

    gameData.nightActionSubmitted.add(player.id);
    if (!gameData.nightActions) gameData.nightActions = {};

    if (healTargetId) {
      gameData.witchHealUsed = true;
      gameData.nightActions['WITCH_HEAL'] = { actorId: player.id, targetId: healTargetId };
    }
    if (poisonTargetId) {
      const target = context.players.find((p) => p.id === poisonTargetId);
      if (!target || !target.isAlive) return false;
      gameData.witchPoisonUsed = true;
      gameData.nightActions['WITCH_POISON'] = { actorId: player.id, targetId: poisonTargetId };
    }

    return true;
  }

  resolveNight(_roomId: string, _context: GameContext, gameData: GameData, deaths: Set<string>, _io: Server): void {
    const healTargetId = gameData.nightActions?.['WITCH_HEAL']?.targetId;
    const poisonTargetId = gameData.nightActions?.['WITCH_POISON']?.targetId;

    if (healTargetId && deaths.has(healTargetId)) {
      deaths.delete(healTargetId);
    }
    if (poisonTargetId) {
      deaths.add(poisonTargetId);
    }
  }
}

RoleRegistry.register('WITCH', new WitchHandler());
