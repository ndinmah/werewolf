import React from 'react';
import clsx from 'clsx';

interface ModalOverlayProps {
  children: React.ReactNode;
  opacity?: 'light' | 'normal' | 'dark' | 'deep';
  className?: string;
  showStars?: boolean;
  starsOpacity?: 'light' | 'normal' | 'heavy';
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({
  children,
  opacity = 'normal',
  className,
  showStars = true,
  starsOpacity = 'normal',
}) => {
  const bgOpacityClasses = {
    light: 'bg-[#030303]/80',
    normal: 'bg-[#030303]/90',
    dark: 'bg-[#030303]/95',
    deep: 'bg-[#030303]/99',
  };

  const starsOpacityClasses = {
    light: 'opacity-10',
    normal: 'opacity-20',
    heavy: 'opacity-30',
  };

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto animate-fade-in backdrop-blur-sm',
        bgOpacityClasses[opacity],
        className
      )}
    >
      {showStars && (
        <div
          className={clsx(
            'absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#8a0303] via-[#030303] to-[#030303]',
            starsOpacityClasses[starsOpacity]
          )}
        />
      )}
      {children}
    </div>
  );
};
