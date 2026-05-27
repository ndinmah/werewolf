import React from 'react';
import { ModalOverlay } from '../../UI/ModalOverlay';

export const FirstNightWaitingOverlay: React.FC = () => {
  return (
    <ModalOverlay opacity="normal" showStars={false}>
      <div className="text-center px-4 relative z-10 animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-900/20 border border-blue-500/20 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.1)] animate-pulse">
          <span className="text-5xl opacity-50">🌙</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-blue-100 mb-3 tracking-wide">Đêm Đầu Tiên</h2>
        <p className="text-blue-300/60 text-lg md:text-xl">
          Xin hãy nhắm mắt lại. Chỉ có một số vai trò đặc biệt được phép thức dậy...
        </p>
      </div>
    </ModalOverlay>
  );
};
