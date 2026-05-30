import { Moon, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[70px] bg-[#030303]/80 backdrop-blur-lg border-b border-[#8a0303]/50 flex justify-between items-center px-8 md:px-16 shadow-[0_4px_30px_rgba(138,3,3,0.15)] font-['Cinzel_Decorative',serif] transition-all duration-300">
      
      {/* Top red glow accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#8a0303] to-transparent opacity-80"></div>

      <Link 
        to="/" 
        className="relative z-10 flex items-center gap-3 group"
      >
        <Moon className="w-6 h-6 text-[#aa8c55] group-hover:text-[#ffdddd] group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_8px_rgba(170,140,85,0.5)]" />
        <span
          className="text-white text-2xl tracking-[0.15em] uppercase font-bold group-hover:text-[#8a0303] transition-colors duration-500"
          style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
        >
          Werewolf
        </span>
      </Link>

      <div className="relative z-10 flex gap-8 items-center">
        <Link
          to="/roles"
          className="relative text-[#e2e8f0] text-sm md:text-base tracking-[0.2em] uppercase hover:text-[#aa8c55] transition-colors duration-300 group flex items-center gap-2"
        >
          <ShieldAlert className="w-4 h-4 opacity-70 group-hover:opacity-100" />
          <span>Thư viện Role</span>
          {/* Animated underline */}
          <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#aa8c55] group-hover:w-full transition-all duration-300 ease-in-out"></span>
        </Link>
      </div>
    </nav>
  );
};
