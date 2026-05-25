import { Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-darker/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-wolf-light transition-colors">
          <Moon className="w-6 h-6 text-wolf" />
          <span className="font-bold text-xl tracking-wider">WEREWOLF</span>
        </Link>
        
        <div className="flex gap-4">
          <Link to="/roles" className="text-gray-300 hover:text-white transition-colors font-medium">
            Thư Viện Role
          </Link>
        </div>
      </div>
    </nav>
  );
};
