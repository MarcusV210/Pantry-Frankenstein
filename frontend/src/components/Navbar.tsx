import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ClipboardList, History, LogOut, Sparkles, UserRound } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-2 px-1 py-2 text-sm transition-colors ${
      isActive ? 'text-white font-semibold after:absolute after:left-0 after:right-0 after:-bottom-[1px] after:h-0.5 after:bg-franken-neon' : 'text-slate-400 hover:text-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-franken-border bg-franken-dark/95 backdrop-blur-md">
      <div className="content-rail flex min-h-[72px] items-center justify-between gap-6">
        <NavLink to="/pantry" className="flex items-center gap-3 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-franken-neon text-franken-dark font-black text-sm">PF</span>
          <span>
            <span className="block display-title text-sm font-extrabold tracking-tight text-white">Pantry Frankenstein</span>
            <span className="block text-[10px] uppercase tracking-[.16em] text-slate-500">Waste less. Cook better.</span>
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-7 self-stretch" aria-label="Primary navigation">
          <NavLink to="/pantry" className={navClass}><ClipboardList className="h-4 w-4" /> Pantry</NavLink>
          <NavLink to="/generate" className={navClass}><Sparkles className="h-4 w-4" /> Generate</NavLink>
          <NavLink to="/history" className={navClass}><History className="h-4 w-4" /> History</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user && <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400"><UserRound className="h-4 w-4 text-franken-neon" /><span className="max-w-[180px] truncate">{user.email}</span></div>}
          <button onClick={handleLogout} title="Sign out" className="flex items-center gap-2 rounded-lg border border-franken-border px-3 py-2 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:text-white">
            <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
      <nav className="content-rail flex items-center gap-6 border-t border-franken-border/70 py-2 md:hidden" aria-label="Mobile navigation">
        <NavLink to="/pantry" className={navClass}>Pantry</NavLink>
        <NavLink to="/generate" className={navClass}>Generate</NavLink>
        <NavLink to="/history" className={navClass}>History</NavLink>
      </nav>
    </header>
  );
};
