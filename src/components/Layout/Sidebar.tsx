import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
  Shield,
  Lock,
  KeyRound,
} from 'lucide-react';

interface SidebarProps {
  onOpenHelp: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenHelp, isOpenMobile, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    reservations,
    resetToDefaultData,
    userRole,
    setIsAuthModalOpen,
  } = useApp();

  const pendingReservationsCount = reservations.filter(r => r.status === 'Pending').length;

  // Dedicated Navigation Items for Barangay Administration vs Public Viewer
  const navItems = userRole === 'admin'
    ? [
        {
          id: 'dashboard' as const,
          label: 'Executive Dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'calendar' as const,
          label: 'Calendar Manager',
          icon: CalendarDays,
          badge: null,
        },
        {
          id: 'reservations' as const,
          label: 'Facility Approvals',
          icon: Building2,
          badge: pendingReservationsCount > 0 ? pendingReservationsCount : null,
          badgeColor: 'bg-accent text-white animate-pulse',
        },
        {
          id: 'audit' as const,
          label: 'Activity Audit Trail',
          icon: ShieldAlert,
          badge: null,
        },
      ]
    : [
        {
          id: 'calendar' as const,
          label: 'Barangay Calendar',
          icon: CalendarDays,
          badge: null,
        },
        {
          id: 'reservations' as const,
          label: 'Facility Booking',
          icon: Building2,
          badge: null,
        },
        {
          id: 'dashboard' as const,
          label: 'Community Overview',
          icon: LayoutDashboard,
          badge: null,
        },
      ];

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-brand-darkest dark:bg-phdark-950 text-white flex flex-col border-r border-brand-navy/60 dark:border-phdark-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Barangay Emblem Header */}
        <div className="p-5 border-b border-brand-navy/50 dark:border-phdark-800 flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gold/70 bg-white shadow-md shrink-0 flex items-center justify-center p-0.5">
            <img
              src="/barangay-logo.jpg"
              alt="Barangay Cantaongon Official Seal"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gold text-brand-darkest">
                Admin Console
              </span>
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight truncate mt-1">
              Brgy. Cantaongon
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              Loon, Bohol • Philippines
            </p>
          </div>
        </div>

        {/* Barangay Official Identification Card */}
        <div className="mx-4 my-3 p-3.5 rounded-2xl bg-brand-navy/50 dark:bg-phdark-850 border border-brand-primary/30 dark:border-phdark-700/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-brand-royal text-white shrink-0 shadow-sm">
              <Shield className="w-4 h-4 text-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gold uppercase tracking-wider font-extrabold">Barangay Secretariat</p>
              <p className="text-xs font-black text-slate-100 truncate">
                Official Administration Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 my-2">
            {userRole === 'admin' ? 'Government Administration' : 'Public Services'}
          </p>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-navy/40 dark:bg-brand-primary'
                    : 'text-slate-300 hover:text-white hover:bg-brand-navy/40 dark:hover:bg-phdark-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-soft' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {userRole !== 'admin' && (
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs bg-gold/15 hover:bg-gold/25 text-gold border border-gold/40 transition-all cursor-pointer shadow-xs"
              >
                <KeyRound className="w-4 h-4" />
                <span>Admin / Secretary Login</span>
              </button>
            </div>
          )}

          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-4 pb-1">
            System Tools
          </p>

          <button
            onClick={onOpenHelp}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-brand-navy/40 dark:hover:bg-phdark-850 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-gold" />
            <span>Usability & Portal Guide</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => {
                if (window.confirm('Restore initial sample records? This will reset your local browser cache.')) {
                  resetToDefaultData();
                }
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-400 hover:text-accent-soft hover:bg-accent/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Data</span>
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-brand-navy/50 dark:border-phdark-800 text-xs text-slate-400 bg-brand-darkest/70">
          <div className="flex items-center justify-between text-[11px]">
            <span>PST (UTC+8)</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Portal Live
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Republic of the Philippines • RA 7160
          </p>
        </div>
      </aside>
    </>
  );
};
