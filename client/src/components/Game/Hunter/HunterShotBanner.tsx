import React from 'react';
import { Crosshair } from 'lucide-react';
import { ModalOverlay } from '../../UI/ModalOverlay';

interface HunterShotBannerProps {
  hunterName: string;
  targetName: string;
}

export const HunterShotBanner: React.FC<HunterShotBannerProps> = ({ hunterName, targetName }) => {
  return (
    <ModalOverlay opacity="light" showStars={false}>
      <div className="bg-[#030303] border border-[#8a0303] max-w-2xl p-10 rounded-none text-center shadow-[0_0_80px_rgba(138,3,3,0.5)] animate-scale-up relative z-10 font-['Cormorant_Garamond',serif] overflow-hidden">
        {/* Blood Splash Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#8a0303]/30 to-transparent pointer-events-none animate-pulse"></div>

        <div className="flex justify-center mb-6 relative z-10">
          <div className="p-6 bg-[#0a0a0a] border border-[#8a0303]/50 text-[#8a0303] shadow-[inset_0_0_20px_rgba(138,3,3,0.5)]">
            <Crosshair className="w-20 h-20 animate-[spin_3s_linear_infinite]" />
          </div>
        </div>
        <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#ffdddd] uppercase tracking-[0.2em] mb-4 drop-shadow-[0_0_10px_rgba(138,3,3,0.8)]">
          Đoạt Mệnh Lệnh!
        </h2>
        <div className="h-px w-32 bg-[#8a0303] mx-auto mb-6"></div>
        <p className="text-gray-300 text-2xl leading-relaxed italic relative z-10">
          Thợ săn{' '}
          <span className="text-[#8a0303] font-['Cinzel_Decorative',serif] font-bold mx-2 text-3xl">{hunterName}</span>
          trong phút hấp hối đã bóp cò, găm viên đạn bạc xuyên thẳng qua tim của
          <span className="text-[#8a0303] font-['Cinzel_Decorative',serif] font-bold mx-2 text-3xl">{targetName}</span>!
        </p>
      </div>
    </ModalOverlay>
  );
};
