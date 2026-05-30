import { Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-[#3a2517] border-b-[4px] border-[#1a0f0a] flex justify-between items-center px-12 shadow-[0_10px_20px_rgba(0,0,0,0.5)] font-['Pirata_One',serif]">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px)" }}></div>
      <Link to="/" className="relative z-10 flex items-center hover:opacity-80 transition-opacity">
        <span className="text-[#f1e6cf] text-[32px] tracking-wide" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>Werewolf</span>
      </Link>
      
      <div className="relative z-10 flex gap-4">
        <Link to="/roles" className="text-[#f1e6cf] text-[24px] tracking-wide hover:text-[#d4b98c] transition-colors" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
          Thư viện Role
        </Link>
      </div>
    </nav>
  );
};
