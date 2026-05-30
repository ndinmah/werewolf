import React from 'react';
import { Moon } from 'lucide-react';
import type { NightStatus } from '../../../types/game';
import { ModalOverlay } from '../../UI/ModalOverlay';

interface NightSleepScreenProps {
  nightStatus: NightStatus | null;
}

export const NightSleepScreen: React.FC<NightSleepScreenProps> = ({ nightStatus }) => {
  return (
    <ModalOverlay opacity="deep" starsOpacity="heavy" className="text-center flex-col font-['Cormorant_Garamond',serif]">
      {/* Mystical Moon Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#030303] rounded-full shadow-[0_0_100px_rgba(200,200,255,0.15)] -z-10 flex items-center justify-center">
        <div className="w-80 h-80 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent rounded-full animate-pulse"></div>
      </div>

      <div className="p-6 rounded-full border border-indigo-500/20 bg-[#030303] mb-8 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] relative">
        <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <Moon className="w-20 h-20 text-indigo-400/80 animate-pulse" />
      </div>
      
      <h2 className="text-5xl font-['Cinzel_Decorative',serif] text-white tracking-[0.15em] uppercase mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
        Màn Đêm Tĩnh Lặng
      </h2>
      
      <p className="text-gray-400 text-2xl italic max-w-xl px-6 leading-relaxed mb-10 border-l border-r border-indigo-500/20">
        "Đừng mở mắt, đừng hé môi. Trong bóng tối, những kẻ săn mồi đang thức giấc..."
      </p>

      {nightStatus?.currentRoleName ? (
        <div className="px-8 py-4 rounded-none bg-[#030303] border border-[#aa8c55]/30 flex flex-col gap-2 items-center min-w-[300px]">
          <span className="text-xs font-sans text-gray-500 uppercase tracking-widest">Tiếng động trong đêm</span>
          <div className="text-lg text-[#aa8c55] animate-pulse font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#aa8c55] inline-block"></span>
            Đang chờ {nightStatus.currentRoleName}
          </div>
        </div>
      ) : (
        <div className="text-gray-600 italic animate-pulse text-lg font-['Cinzel_Decorative',serif] tracking-widest">
          Sương mù đang phủ kín lối đi...
        </div>
      )}
    </ModalOverlay>
  );
};
