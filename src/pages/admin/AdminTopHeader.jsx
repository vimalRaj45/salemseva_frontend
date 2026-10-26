import React from 'react';
import { Search, Bell, ShieldCheck, LogOut, Menu } from 'lucide-react';

/**
 * Admin Top Header Bar
 * Deep Forest Emerald sticky header (#123B32) with brand tag, global search,
 * real-time notification trigger, RBAC super admin profile badge, and logout.
 */
export default function AdminTopHeader({
  searchQuery = '',
  onSearchChange = () => {},
  unreadCount = 0,
  onOpenNotifications = () => {},
  user = { name: 'Vimal Raj', role: 'super_admin' },
  onLogout = () => {},
  onToggleMobileMenu = () => {}
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#123B32] text-white px-3 sm:px-6 py-2 flex items-center justify-between gap-2 border-b border-[#2F5B4E] shadow-md h-14">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <a href="#/admin" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-sans font-black text-xs sm:text-sm tracking-tight text-white whitespace-nowrap">
            SHAZU SOFT
          </span>
          <span className="px-1.5 py-0.5 bg-[#C47D4C] text-[9px] font-mono font-bold uppercase rounded text-white tracking-widest hidden sm:inline">
            CONTROL PANEL
          </span>
        </a>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex items-center flex-1 max-w-[140px] sm:max-w-xs md:max-w-md mx-1 sm:mx-4 min-w-0">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-300 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full bg-white/10 border border-white/15 pl-8 pr-3 py-1.5 rounded-lg text-xs text-white placeholder:text-slate-300 focus:outline-none focus:bg-white/20 focus:border-[#C47D4C] transition-all font-sans"
            aria-label="Global system search"
          />
        </div>
      </div>

      {/* Right: Activity Bell, RBAC Badge, Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Activity & Notifications Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          title="Telemetry Activity"
          className="flex items-center gap-1 bg-[#C47D4C]/30 hover:bg-[#C47D4C]/50 border border-[#C47D4C] text-amber-200 px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
          aria-label={`System notifications: ${unreadCount} unread`}
        >
          <Bell className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
          <span className="px-1 py-0.5 bg-[#C47D4C] text-white font-mono font-bold text-[10px] rounded leading-none">
            {unreadCount}
          </span>
        </button>

        {/* RBAC Role Indicator */}
        <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs text-white font-medium shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <span className="font-bold text-[11px] truncate hidden sm:block max-w-[110px]">
            {user?.name || 'System Super Admin'}
          </span>
          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded text-[9px] font-mono font-bold uppercase tracking-wider leading-none hidden md:inline">
            SUPER ADMIN
          </span>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          title="Logout"
          className="flex items-center gap-1 bg-red-950/60 hover:bg-red-900/80 border border-red-700/50 px-2.5 py-1.5 rounded-lg text-xs text-red-200 font-semibold transition-colors cursor-pointer shrink-0"
          aria-label="Logout of admin console"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
