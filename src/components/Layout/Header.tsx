import React, { useState, useEffect } from 'react';
import { useApp, getInitials } from '../../context/AppContext';
import { UserProfileModal } from '../Common/UserProfileModal';
import { AuthModal } from '../Common/AuthModal';
import {
  Menu,
  Moon,
  Sun,
  Search,
  Bell,
  Calendar,
  Building2,
  Clock,
  Lock,
  KeyRound,
  UserPlus,
  Edit3,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenNewEventModal: () => void;
  onOpenNewReservationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenNewEventModal,
  onOpenNewReservationModal,
}) => {
  const {
    isDarkMode,
    toggleDarkMode,
    currentUser,
    reservations,
    events,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    navigateToEventInCalendar,
    userRole,
    lockAdmin,
    setIsAuthModalOpen,
  } = useApp();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Philippine Standard Time Clock
  const [currentPST, setCurrentPST] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Philippine Time
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila',
      };
      try {
        setCurrentPST(new Intl.DateTimeFormat('en-PH', options).format(now));
      } catch (e) {
        setCurrentPST(now.toLocaleString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Notifications dropdown state
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const pendingReservations = reservations.filter(r => r.status === 'Pending');
  const upcomingEvents = events.slice(0, 5);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-phdark-900/95 backdrop-blur-md border-b border-slate-200 dark:border-phdark-800 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-xs">
      {/* Left section: Mobile menu & Live PST Clock */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-brand-dark dark:hover:text-white rounded-lg lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Logo Brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gold/70 bg-white shrink-0 p-0.5 shadow-xs">
            <img
              src="/barangay-logo.jpg"
              alt="Barangay Seal"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="font-bold text-xs text-slate-800 dark:text-white truncate">
            Brgy. Cantaongon
          </span>
        </div>

        {/* Philippine Standard Time (PST) Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-phdark-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-phdark-700 font-mono">
          <Clock className="w-3.5 h-3.5 text-brand-royal dark:text-blue-400" />
          <span className="font-medium">{currentPST || 'PST (UTC+8)'}</span>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-md mx-3 sm:mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, bookings, officials..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Buttons */}
        <button
          onClick={onOpenNewEventModal}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>+ Add Event</span>
        </button>

        <button
          onClick={onOpenNewReservationModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>+ Book Facility</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-phdark-800 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingReservations.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-phdark-900 border border-slate-200 dark:border-phdark-700 shadow-xl z-50 p-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-phdark-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-primary dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      System Notifications
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {pendingReservations.length} action item(s)
                  </span>
                </div>

                <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto">
                  {pendingReservations.length > 0 ? (
                    pendingReservations.map(res => (
                      <div
                        key={res.id}
                        onClick={() => {
                          setActiveTab('reservations');
                          setIsNotifOpen(false);
                        }}
                        className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-phdark-850 cursor-pointer hover:bg-amber-100/60 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                          <span>Pending Facility Request</span>
                          <span className="text-[10px] bg-amber-200 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                            {res.referenceNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                          {res.organizationName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {res.venue} • {res.date} ({res.startTime}-{res.endTime})
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-500">
                      No pending facility booking requests.
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-phdark-800">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                      Upcoming Sessions
                    </p>
                    {upcomingEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 text-center italic">No upcoming sessions</p>
                    ) : (
                      upcomingEvents.map(evt => (
                        <div
                          key={evt.id}
                          onClick={() => {
                            navigateToEventInCalendar(evt);
                            setIsNotifOpen(false);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-phdark-800 cursor-pointer text-xs flex items-center justify-between"
                        >
                          <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300 font-medium">
                            {evt.title}
                          </span>
                          <span className="text-[10px] text-slate-500 shrink-0">{evt.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-phdark-800 transition-colors"
          aria-label="Toggle theme mode"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-gold" />
          ) : (
            <Moon className="w-4 h-4 text-brand-dark" />
          )}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-phdark-700 hidden sm:block" />

        {/* Role & Secretary Auth Section */}
        <div className="flex items-center gap-2 pl-1">
          {userRole === 'admin' ? (
            <div className="flex items-center gap-1.5">
              {currentUser.name ? (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-phdark-800 border border-transparent hover:border-slate-200 dark:hover:border-phdark-700 transition-all cursor-pointer group text-left"
                  title="Click to edit Secretary profile"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:ring-2 ring-gold/60 transition-all">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                        {currentUser.name}
                      </p>
                      <Edit3 className="w-2.5 h-2.5 text-slate-400 group-hover:text-brand-primary transition-colors" />
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[140px]">
                      ● Secretary Mode
                    </p>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-accent/60 bg-accent/5 hover:bg-accent/15 text-accent dark:text-accent-light transition-all cursor-pointer group shadow-xs animate-pulse hover:animate-none"
                  title="Click to input the Barangay Secretary details"
                >
                  <div className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-110 transition-transform">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold leading-tight">
                      + Set Secretary Profile
                    </p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 hidden sm:block">
                      Syncs to all devices
                    </p>
                  </div>
                </button>
              )}

              {/* Lock Button to return to Public Viewer mode */}
              <button
                onClick={lockAdmin}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Lock admin controls (Switch to Public Viewer Mode)"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {currentUser.name && (
                <div className="hidden md:flex items-center gap-2 pr-1 text-right">
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                      Barangay Secretary
                    </p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {currentUser.name}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-phdark-800 dark:hover:bg-phdark-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-phdark-700 shadow-2xs hover:border-brand-primary/40"
                title="Click to enter PIN 1234 for Secretary Access"
              >
                <KeyRound className="w-3.5 h-3.5 text-brand-primary dark:text-gold" />
                <span>Secretary Login</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile Modal */}
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />

        {/* Secretary PIN Auth Modal */}
        <AuthModal />
      </div>
    </header>
  );
};
