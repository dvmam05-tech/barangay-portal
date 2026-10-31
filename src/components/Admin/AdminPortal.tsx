import React from 'react';
import { useApp } from '../../context/AppContext';
import { Dashboard } from '../Dashboard/Dashboard';
import { ReservationView } from '../Reservations/ReservationView';
import { CalendarView } from '../Calendar/CalendarView';
import { AuditLogView } from '../AuditLog/AuditLogView';
import type { Venue } from '../../types';
import { Building2, PlusCircle } from 'lucide-react';

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
  const { activeTab, setActiveTab, reservations, isSupabaseConnected, userRole } = useApp();
  const pendingReservations = reservations.filter(r => r.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Unified Master Government Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-darkest via-brand-dark to-brand-navy p-6 rounded-2xl border border-brand-primary/40 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Seal Logo + Official Identity & Description */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gold/80 bg-white shadow-md shrink-0 flex items-center justify-center p-0.5">
              <img
                src="/barangay-logo.jpg"
                alt="Barangay Cantaongon Official Seal"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gold text-brand-darkest shadow-xs">
                  Government Console
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-accent text-white shadow-xs">
                  Official LGU Portal
                </span>
                {isSupabaseConnected && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Supabase Live</span>
                  </span>
                )}
                <span className="text-xs text-slate-300 font-medium">
                  Office of the Punong Barangay & Secretariat • Municipality of Loon, Province of Bohol
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                Sangguniang Barangay Cantaongon
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Centralized municipal management for community events, public venue reservations, facility approvals, and institutional audit tracking.
              </p>
            </div>
          </div>

          {/* Right: Clean, Non-Duplicated Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
            {userRole === 'admin' ? (
              <>
                <button
                  onClick={onOpenNewEventModal}
                  className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ New Official Event</span>
                </button>

                <button
                  onClick={() => onOpenBookingModal()}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer border border-white/10"
                >
                  <Building2 className="w-4 h-4 text-gold" />
                  <span>Book Facility</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onOpenBookingModal()}
                className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-white" />
                <span>+ Request Facility Booking</span>
              </button>
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
