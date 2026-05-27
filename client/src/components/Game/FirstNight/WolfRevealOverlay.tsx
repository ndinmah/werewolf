import React from 'react';
import { ModalOverlay } from '../../UI/ModalOverlay';
import type { Player } from '../../../types/game';

interface WolfRevealOverlayProps {
  myPlayer: Player | undefined | null;
  teammates: Pick<Player, 'id' | 'name'>[];
}

export const WolfRevealOverlay: React.FC<WolfRevealOverlayProps> = ({
  myPlayer,
  teammates,
}) => {
  return (
    <ModalOverlay opacity="normal" showStars={false}>
      <div className="bg-darker border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-900/30 text-center relative z-10 animate-scale-up">
        <div className="w-20 h-20 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
          <span className="text-4xl">🐺</span>
        </div>
        <h2 className="text-3xl font-black text-red-500 tracking-wider uppercase mb-2">Đồng Bọn Ma Sói</h2>

        <div className="space-y-3">
          <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl">
            <span className="text-red-300 font-bold text-lg">{myPlayer?.name} (Bạn)</span>
          </div>

          {teammates.length > 0 ? (
            teammates.map((teammate) => (
              <div key={teammate.id} className="p-4 bg-dark border border-gray-800 rounded-xl shadow-inner">
                <span className="text-gray-200 font-semibold text-lg">{teammate.name}</span>
              </div>
            ))
          ) : (
            <div className="p-4 bg-dark border border-gray-800 rounded-xl border-dashed">
              <span className="text-gray-500 italic">Bạn là con Sói duy nhất lẻ loi...</span>
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};
