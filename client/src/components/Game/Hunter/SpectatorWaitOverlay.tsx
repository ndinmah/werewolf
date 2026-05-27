import React from 'react';
import { Target } from 'lucide-react';
import { ModalOverlay } from '../../UI/ModalOverlay';

export const SpectatorWaitOverlay: React.FC = () => {
  return (
    <ModalOverlay opacity="normal" className="flex-col text-center">
      <Target className="w-20 h-20 text-red-500 animate-spin-slow mb-6" />
      <h2 className="text-3xl font-extrabold text-white mb-2 tracking-wide">Nín Thở Chờ Đợi...</h2>
      <p className="text-gray-400 text-lg max-w-md leading-relaxed px-4">
        Thợ Săn đang hấp hối và có quyền nổ súng kéo theo một người chết cùng. Cầu nguyện rằng họng súng đen ngòm đó không
        chĩa về phía bạn!
      </p>
    </ModalOverlay>
  );
};
