import React from 'react';
import { ModalOverlay } from '../../UI/ModalOverlay';
import type { Player } from '../../../types/game';

interface LoverRevealOverlayProps {
  myPlayer: Player | undefined | null;
  partnerName: string | null;
}

export const LoverRevealOverlay: React.FC<LoverRevealOverlayProps> = ({
  myPlayer,
  partnerName,
}) => {
  return (
    <ModalOverlay opacity="normal" showStars={false}>
      <div className="bg-darker border border-pink-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-pink-900/30 text-center relative z-10 animate-scale-up">
        <div className="w-20 h-20 bg-pink-950 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.4)] animate-pulse">
          <span className="text-4xl">💘</span>
        </div>
        <h2 className="text-3xl font-black text-pink-500 tracking-wider uppercase mb-2">Người Tình Nhận Diện</h2>
        <p className="text-pink-300 text-sm mb-6 leading-relaxed">
          Bạn đã được Cupid kết nối tơ duyên! Hai bạn đã liên kết sinh tử (một người chết, người kia chết theo). Nếu hai bạn khác phe, hai bạn phải là 2 người cuối cùng sống sót để giành chiến thắng.
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-pink-900/20 border border-pink-500/20 rounded-xl">
            <span className="text-pink-300 font-bold text-lg">{myPlayer?.name} (Bạn)</span>
          </div>

          {partnerName ? (
            <div className="p-4 bg-dark border border-gray-800 rounded-xl shadow-inner">
              <span className="text-gray-200 font-semibold text-lg">{partnerName} (Người tình của bạn)</span>
            </div>
          ) : (
            <div className="p-4 bg-dark border border-gray-800 rounded-xl border-dashed">
              <span className="text-gray-500 italic">Không tìm thấy người yêu...</span>
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};
