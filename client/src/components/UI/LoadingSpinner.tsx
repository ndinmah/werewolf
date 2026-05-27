import React from 'react';
import { Loader2 } from 'lucide-react';
import { ModalOverlay } from './ModalOverlay';

interface LoadingSpinnerProps {
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Đang tải...',
  fullPage = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center select-none">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      <p className="text-gray-400 text-sm font-semibold tracking-wide animate-pulse">{text}</p>
    </div>
  );

  if (fullPage) {
    return (
      <ModalOverlay opacity="normal" showStars={true} starsOpacity="normal">
        {content}
      </ModalOverlay>
    );
  }

  return content;
};
