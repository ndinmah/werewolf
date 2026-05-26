import type { GamePhase } from '../types/game';

export interface PhaseMeta {
  id: GamePhase;
  name: string;
}

export const PHASE_METADATA: Record<GamePhase, PhaseMeta> = {
  roleReveal: { id: 'roleReveal', name: 'Nhận Vai Trò' },
  firstNight: { id: 'firstNight', name: 'Đêm Đầu Tiên' },
  dayStart: { id: 'dayStart', name: 'Bình Minh' },
  discussion: { id: 'discussion', name: 'Thảo Luận' },
  dayDiscuss: { id: 'dayDiscuss', name: 'Thảo Luận' },
  voting: { id: 'voting', name: 'Bỏ Phiếu' },
  dayEnd: { id: 'dayEnd', name: 'Hoàng Hôn' },
  night: { id: 'night', name: 'Ban Đêm' },
  hunterRetaliation: { id: 'hunterRetaliation', name: 'Thợ Săn Trả Thù' },
  gameOver: { id: 'gameOver', name: 'Kết Thúc' },
};

export const getPhaseName = (phase?: GamePhase): string => {
  if (!phase || !PHASE_METADATA[phase]) return 'Đang xử lý...';
  return PHASE_METADATA[phase].name;
};
