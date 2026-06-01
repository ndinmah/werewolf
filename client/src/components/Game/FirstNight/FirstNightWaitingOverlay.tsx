import React from 'react';
import { ModalOverlay } from '../../UI/ModalOverlay';
import { S } from '../../../constants/strings';

export const FirstNightWaitingOverlay: React.FC = () => {
  return (
    <ModalOverlay opacity="deep" showStars={true}>
      <div className="text-center px-6 relative z-10 animate-fade-in font-['Cormorant_Garamond',serif] flex flex-col items-center">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-900 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#030303] border border-indigo-500/30 mb-8 shadow-[inset_0_0_30px_rgba(99,102,241,0.2),0_0_40px_rgba(99,102,241,0.1)] relative">
          <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <span className="text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse">🌙</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-['Cinzel_Decorative',serif] text-indigo-200 mb-4 tracking-[0.15em] uppercase drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
          {S.firstNightWaiting.title}
        </h2>
        <div className="h-px w-32 bg-linear-to-r from-transparent via-indigo-500/50 to-transparent mx-auto mb-6"></div>
        <p className="text-indigo-200/60 text-xl md:text-2xl italic max-w-xl leading-relaxed">
          {S.firstNightWaiting.quote}
        </p>
      </div>
    </ModalOverlay>
  );
};
