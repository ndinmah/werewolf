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
    light: 'bg-slate-950/80',
    normal: 'bg-slate-950/95',
    dark: 'bg-slate-950/98',
    deep: 'bg-slate-950/99',
  };

  const starsOpacityClasses = {
    light: 'opacity-20',
    normal: 'opacity-30',
    heavy: 'opacity-40',
  };

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto animate-fade-in',
        bgOpacityClasses[opacity],
        className
      )}
    >
      {showStars && (
        <div
          className={clsx(
            'absolute inset-0 stars-bg pointer-events-none',
            starsOpacityClasses[starsOpacity]
          )}
        />
      )}
      {children}
    </div>
  );
};
