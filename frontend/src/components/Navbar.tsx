import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sparkles, UtensilsCrossed, History, LogOut, Beaker, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-emerald-500/20 text-franken-neon border border-emerald-500/30 shadow-glow-emerald'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-franken-border bg-franken-surface/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <NavLink to="/pantry" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center shadow-glow-emerald group-hover:scale-105 transition-transform">
              <Beaker className="w-5 h-5 text-franken-dark" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-lg tracking-tight text-white">
                <span>Pantry</span>
                <span className="text-franken-neon">Frankenstein</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30">AI Lab</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Expiring to Epic</p>
            </div>
          </NavLink>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/pantry" className={navClass}>
              <UtensilsCrossed className="w-4 h-4" />
              <span>Pantry Inventory</span>
            </NavLink>

            <NavLink to="/generate" className={navClass}>
              <Sparkles className="w-4 h-4 text-franken-neon" />
              <span>Synthesizer Lab</span>
            </NavLink>

            <NavLink to="/history" className={navClass}>
              <History className="w-4 h-4 text-purple-400" />
              <span>Recipe Vault</span>
            </NavLink>
          </nav>
        </div>

        {/* User & Logout */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-franken-card border border-franken-border text-xs text-slate-300">
              <UserIcon className="w-3.5 h-3.5 text-franken-neon" />
              <span className="font-mono max-w-[150px] truncate">{user.email}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-500/30 border border-slate-700/60 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-franken-border bg-franken-dark/95 px-2">
        <NavLink to="/pantry" className={navClass}>
          <UtensilsCrossed className="w-4 h-4" />
          <span>Pantry</span>
        </NavLink>
        <NavLink to="/generate" className={navClass}>
          <Sparkles className="w-4 h-4 text-franken-neon" />
          <span>Synthesizer</span>
        </NavLink>
        <NavLink to="/history" className={navClass}>
          <History className="w-4 h-4 text-purple-400" />
          <span>Vault</span>
        </NavLink>
      </div>
    </header>
  );
};
