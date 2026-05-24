import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-darker disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-wolf hover:bg-wolf-light text-white focus:ring-wolf',
    secondary: 'bg-dark border border-gray-700 hover:bg-gray-800 text-white focus:ring-gray-500',
    villager: 'bg-villager hover:bg-villager-light text-white focus:ring-villager',
    ghost: 'hover:bg-gray-800 text-gray-300 hover:text-white focus:ring-gray-500',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
};
