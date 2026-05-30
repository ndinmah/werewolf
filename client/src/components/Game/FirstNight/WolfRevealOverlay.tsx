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
    <ModalOverlay opacity="deep" showStars={false}>
      <div className="bg-[#030303] border border-[#8a0303]/50 rounded-none p-10 max-w-lg w-full shadow-[0_0_50px_rgba(138,3,3,0.3)] text-center relative z-10 animate-scale-up font-['Cormorant_Garamond',serif]">
        
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#8a0303]/20 to-transparent pointer-events-none"></div>

        <div className="w-24 h-24 bg-[#0a0a0a] rounded-none flex items-center justify-center mx-auto mb-6 border border-[#8a0303]/50 shadow-[inset_0_0_20px_rgba(138,3,3,0.5)]">
          <span className="text-5xl animate-pulse drop-shadow-[0_0_10px_rgba(138,3,3,0.8)]">🐺</span>
        </div>
        
        <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#ffdddd] tracking-widest uppercase mb-4 drop-shadow-[0_0_10px_rgba(138,3,3,0.8)]">Bầy Đàn Thức Giấc</h2>
        <div className="h-px w-32 bg-linear-to-r from-transparent via-[#8a0303] to-transparent mx-auto mb-6"></div>

        <div className="space-y-4 relative z-10">
          <div className="p-5 bg-[#030303] border border-[#8a0303]/50 rounded-none relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#8a0303]/10 to-transparent"></div>
            <span className="font-['Cinzel_Decorative',serif] text-[#ffdddd] text-2xl tracking-wider relative z-10">{myPlayer?.name} <span className="text-sm text-gray-400 font-sans tracking-widest uppercase ml-2">(Ngươi)</span></span>
          </div>

          {teammates.length > 0 ? (
            teammates.map((teammate) => (
              <div key={teammate.id} className="p-5 bg-[#0a0a0a] border border-[#8a0303]/30 rounded-none shadow-inner relative">
                <span className="font-['Cinzel_Decorative',serif] text-[#ffdddd] text-2xl tracking-wider relative z-10">{teammate.name}</span>
              </div>
            ))
          ) : (
            <div className="p-5 bg-[#030303] border border-white/10 rounded-none border-dashed relative">
              <span className="text-gray-500 italic text-xl">Ngươi là con sói độc hành trong đêm nay...</span>
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};
