import React from 'react';
import clsx from 'clsx';

interface AvatarProps {
  name?: string;
  fallbackIcon?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  fallbackIcon,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  const initial = name ? name.charAt(0).toUpperCase() : '';

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-bold border select-none shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {fallbackIcon || initial}
    </div>
  );
};
