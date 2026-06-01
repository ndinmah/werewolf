import React from 'react';
import { Loader2 } from 'lucide-react';
import { ModalOverlay } from './ModalOverlay';
import { S } from '../../constants/strings';

interface LoadingSpinnerProps {
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = S.game.loading,
  fullPage = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6 text-center select-none relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#8a0303] rounded-full blur-2xl opacity-20 animate-pulse"></div>
      <Loader2 className="w-12 h-12 text-[#aa8c55] animate-spin relative z-10" />
      <p className="text-[#aa8c55] text-lg font-['Cinzel_Decorative',serif] tracking-[0.2em] uppercase animate-pulse relative z-10">
        {text}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <ModalOverlay opacity="normal" showStars={false} starsOpacity="normal">
        {content}
      </ModalOverlay>
    );
  }

  return content;
};
