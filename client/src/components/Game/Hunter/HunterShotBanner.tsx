import React from 'react';
import { Target } from 'lucide-react';
import { ModalOverlay } from '../../UI/ModalOverlay';

interface HunterShotBannerProps {
  hunterName: string;
  targetName: string;
}

export const HunterShotBanner: React.FC<HunterShotBannerProps> = ({
  hunterName,
  targetName,
}) => {
  return (
    <ModalOverlay opacity="light" showStars={false}>
      <div className="bg-dark/95 border border-red-500 max-w-xl p-8 rounded-2xl text-center shadow-2xl animate-scale-up relative z-10">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-red-950/60 border border-red-500/30 rounded-full text-red-500 animate-bounce">
            <Target className="w-16 h-16" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">🔫 Phát Súng Cuối Cùng!</h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          Thợ săn <span className="text-red-400 font-extrabold">{hunterName}</span> trước khi trút hơi thở cuối cùng
          đã rút súng nhắm thẳng vào thái dương của <span className="text-red-400 font-extrabold">{targetName}</span>{' '}
          và bóp cò!
        </p>
      </div>
    </ModalOverlay>
  );
};
