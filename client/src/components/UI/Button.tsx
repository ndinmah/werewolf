import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'villager' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold transition-all duration-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group uppercase tracking-[0.2em] font-["Cinzel_Decorative",serif]';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-[#8a0303]/10 border border-[#8a0303] text-[#ffdddd] hover:bg-[#8a0303] hover:text-white shadow-[0_0_15px_rgba(138,3,3,0.2)]',
    secondary: 'bg-transparent border border-[#aa8c55]/50 text-[#aa8c55] hover:bg-[#aa8c55]/10 hover:border-[#aa8c55] hover:text-[#ffdddd]',
    villager: 'bg-[#0a0a0a] border border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/10',
    ghost: 'bg-transparent border border-transparent text-gray-400 hover:text-white hover:border-white/10',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-6 py-3',
    lg: 'text-lg px-8 py-4',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 w-0 bg-[#8a0303] group-hover:w-full transition-all duration-500 ease-in-out z-0"></div>
      )}
      {variant === 'secondary' && (
        <div className="absolute inset-0 w-0 bg-[#aa8c55]/20 group-hover:w-full transition-all duration-500 ease-in-out z-0"></div>
      )}
    </button>
  );
};
