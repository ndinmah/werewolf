import React from 'react';
import { ModalOverlay } from '../../UI/ModalOverlay';
import { Heart } from 'lucide-react';
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
    <ModalOverlay opacity="deep" showStars={false}>
      <div className="bg-[#030303] border border-[#be185d]/50 rounded-none p-10 max-w-lg w-full shadow-[0_0_50px_rgba(190,24,93,0.3)] text-center relative z-10 animate-scale-up font-['Cormorant_Garamond',serif]">
        
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#be185d]/20 to-transparent pointer-events-none"></div>

        <div className="w-24 h-24 bg-[#0a0a0a] rounded-none flex items-center justify-center mx-auto mb-6 border border-[#be185d]/50 shadow-[inset_0_0_20px_rgba(190,24,93,0.5)]">
          <Heart className="w-12 h-12 text-[#fbcfe8] fill-[#be185d] animate-pulse" />
        </div>
        
        <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#fbcfe8] tracking-widest uppercase mb-4 drop-shadow-[0_0_10px_rgba(190,24,93,0.8)]">Duyên Định Mệnh</h2>
        <div className="h-px w-32 bg-linear-to-r from-transparent via-[#be185d] to-transparent mx-auto mb-6"></div>
        
        <p className="text-gray-300 text-xl mb-8 leading-relaxed italic relative z-10">
          "Sinh cùng sinh, tử cùng tử." Sợi chỉ đỏ đã buộc chặt linh hồn hai người. Nếu không cùng phe, các ngươi phải giẫm lên xác của tất cả để tồn tại.
        </p>

        <div className="space-y-4 relative z-10">
          <div className="p-5 bg-[#030303] border border-[#be185d]/50 rounded-none relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#be185d]/10 to-transparent"></div>
            <span className="font-['Cinzel_Decorative',serif] text-[#fbcfe8] text-2xl tracking-wider relative z-10">{myPlayer?.name} <span className="text-sm text-gray-400 font-sans tracking-widest uppercase ml-2">(Ngươi)</span></span>
          </div>

          <div className="text-[#be185d] animate-pulse">
            <Heart className="w-6 h-6 mx-auto fill-current" />
          </div>

          {partnerName ? (
            <div className="p-5 bg-[#0a0a0a] border border-[#be185d]/30 rounded-none shadow-inner relative">
              <span className="font-['Cinzel_Decorative',serif] text-[#fbcfe8] text-2xl tracking-wider relative z-10">{partnerName}</span>
            </div>
          ) : (
            <div className="p-5 bg-[#030303] border border-white/10 rounded-none border-dashed relative">
              <span className="text-gray-500 italic text-xl">Không tìm thấy tri kỷ...</span>
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};
