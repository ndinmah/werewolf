import React from 'react';
import { Target } from 'lucide-react';
import { ModalOverlay } from '../../UI/ModalOverlay';
import { S } from '../../../constants/strings';

export const SpectatorWaitOverlay: React.FC = () => {
  return (
    <ModalOverlay opacity="deep" className="flex-col text-center font-['Cormorant_Garamond',serif]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8a0303] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>

      <div className="p-6 bg-[#030303] rounded-none border border-[#8a0303]/50 mb-8 relative shadow-[inset_0_0_20px_rgba(138,3,3,0.3)]">
        <div className="absolute inset-0 border border-[#8a0303]/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <Target className="w-20 h-20 text-[#8a0303] animate-pulse" />
      </div>
      
      <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#ffdddd] mb-4 tracking-[0.15em] uppercase drop-shadow-[0_0_10px_rgba(138,3,3,0.5)]">
        {S.hunter.spectatorTitle}
      </h2>
      <div className="h-px w-24 bg-linear-to-r from-transparent via-[#8a0303] to-transparent mx-auto mb-6"></div>
      <p className="text-gray-400 text-2xl italic max-w-lg leading-relaxed px-6 border-l border-r border-[#8a0303]/20">
        {S.hunter.spectatorStory}
      </p>
    </ModalOverlay>
  );
};
