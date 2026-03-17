import React from 'react';
import { ShoppingCart, Search, User, Menu } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onAdminClick: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick, onAdminClick, searchTerm, onSearchChange }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gold/20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo size="sm" />
          </div>
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 gap-2">
            <Search size={18} className="text-gold/60" />
            <input
              type="text"
              placeholder="Buscar perfume..."
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40 w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onAdminClick}
            className="hidden md:flex items-center gap-2 text-white/80 hover:text-gold transition-colors text-sm font-medium"
          >
            <User size={20} />
            Admin
          </button>
          <button 
            onClick={onCartClick}
            className="relative p-2 text-white hover:text-gold transition-colors"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button className="md:hidden text-white">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}
