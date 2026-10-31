import React from 'react';
import { useApp } from '../../context/AppContext';
import { Dashboard } from '../Dashboard/Dashboard';
import { ReservationView } from '../Reservations/ReservationView';
import { CalendarView } from '../Calendar/CalendarView';
import { AuditLogView } from '../AuditLog/AuditLogView';
import type { Venue } from '../../types';
import { Building2, PlusCircle, KeyRound } from 'lucide-react';

interface AdminPortalProps {
  onOpenBookingModal: (preset?: {
    venue?: Venue;
    date?: string;
    startTime?: string;
    endTime?: string;
  }) => void;
  onOpenNewEventModal: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onOpenBookingModal,
  onOpenNewEventModal,
}) => {
  const { activeTab, setActiveTab, reservations, isSupabaseConnected, userRole, setIsAuthModalOpen } = useApp();
  const pendingReservations = reservations.filter(r => r.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Unified Master Government Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-darkest via-brand-dark to-brand-navy p-4 sm:p-6 rounded-2xl border border-brand-primary/40 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
          {/* Left: Seal Logo + Official Identity & Description */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gold/80 bg-white shadow-md shrink-0 flex items-center justify-center p-0.5">
              <img
                src="/barangay-logo.jpg"
                alt="Barangay Cantaongon Official Seal"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gold text-brand-darkest shadow-xs">
                  Government Console
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide uppercase bg-accent text-white shadow-xs">
                  Official LGU Portal
                </span>
                {isSupabaseConnected && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Supabase Live</span>
                  </span>
                )}
                <span className="hidden md:inline text-xs text-slate-300 font-medium">
                  Office of the Punong Barangay & Secretariat • Loon, Bohol
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                Sangguniang Barangay Cantaongon
              </h1>
              <p className="hidden sm:block text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Centralized municipal management for community events, public venue reservations, facility approvals, and institutional audit tracking.
              </p>
            </div>
          </div>

          {/* Right: Clean, Non-Duplicated Action Controls */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto lg:self-center shrink-0">
            {userRole === 'admin' ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onOpenNewEventModal}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ New Event</span>
                </button>

                <button
                  onClick={() => onOpenBookingModal()}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <Building2 className="w-4 h-4 text-gold" />
                  <span>Book Facility</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-brand-darkest text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <KeyRound className="w-4 h-4 text-brand-darkest" />
                  <span>Admin Login</span>
                </button>

                <button
                  onClick={() => onOpenBookingModal()}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-white" />
                  <span>+ Book Facility</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN VIEWS (Controlled directly by the persistent sidebar) */}
      {activeTab === 'dashboard' && (
        <Dashboard
          onOpenNewEventModal={onOpenNewEventModal}
          onOpenNewReservationModal={() => onOpenBookingModal()}
        />
      )}

      {activeTab === 'reservations' && (
        <ReservationView onOpenBookingModal={onOpenBookingModal} />
      )}

      {activeTab === 'calendar' && (
        <CalendarView onOpenAddModal={onOpenNewEventModal} />
      )}

      {activeTab === 'audit' && <AuditLogView />}
    </div>
  );
};
