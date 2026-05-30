import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  imageUrl?: string;
}

export const Avatar = ({ name, size = 'md', className, imageUrl }: AvatarProps) => {
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const baseClasses =
    'inline-flex items-center justify-center font-["Cinzel_Decorative",serif] font-bold tracking-widest shrink-0 overflow-hidden bg-[#030303] border border-white/20 text-gray-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] uppercase';

  return (
    <div className={twMerge(clsx(baseClasses, sizeClasses[size], className))}>
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
