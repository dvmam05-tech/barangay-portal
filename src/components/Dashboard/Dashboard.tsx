import React from 'react';
import { useApp, timeToMinutes } from '../../context/AppContext';
import {
  Calendar,
  Building2,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  MapPin,
  CalendarCheck,
  Clock,
  Landmark,
} from 'lucide-react';
import { VENUE_DETAILS } from '../../data/initialData';

interface DashboardProps {
  onOpenNewEventModal: () => void;
  onOpenNewReservationModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewEventModal,
  onOpenNewReservationModal,
}) => {
  const {
    events,
    reservations,
    auditLogs,
    setActiveTab,
    userRole,
    navigateToEventInCalendar,
  } = useApp();

  const pendingReservations = reservations.filter(r => r.status === 'Pending');
  const approvedReservations = reservations.filter(r => r.status === 'Approved');

  // Next upcoming event for quick preview
  const nextEvent = events.length > 0 ? events[0] : null;

  // Determine current facility status for today using Philippine Standard Time (PST UTC+8)
  const checkFacilityCurrentStatus = (venueName: string) => {
    const now = new Date();
    // Get live date in Asia/Manila (YYYY-MM-DD)
    const todayPST = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    // Get live time in minutes from midnight (Manila time)
    const manilaTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Manila', hour12: false });
    const [h, m] = manilaTimeStr.split(':').map(Number);
    const nowMinutes = (h || 0) * 60 + (m || 0);

    const occupyingEvent = events.find(e => {
      if (e.venue !== venueName || e.date !== todayPST) return false;
      if (e.status === 'Cancelled') return false;
      const start = timeToMinutes(e.startTime);
      const end = timeToMinutes(e.endTime);
      return nowMinutes >= start && nowMinutes <= end;
    });

    if (occupyingEvent) {
      return { isOccupied: true, occupyingTitle: occupyingEvent.title, until: occupyingEvent.endTime };
    }
    return { isOccupied: false };
  };

  const gymStatus = checkFacilityCurrentStatus('Barangay Gymnasium');
  const hallStatus = checkFacilityCurrentStatus('Multipurpose Barangay Hall');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Events */}
        <div
          onClick={() => {
            if (nextEvent) {
              navigateToEventInCalendar(nextEvent);
            } else {
              setActiveTab('calendar');
            }
          }}
          className="p-5 rounded-2xl bg-white dark:bg-phdark-900 border border-slate-200 dark:border-phdark-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Scheduled Events</span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-brand-royal dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {events.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-medium">
              {events.length === 1 ? 'Event on Calendar' : 'Events on Calendar'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-brand-primary dark:text-blue-400 font-medium pt-2 border-t border-slate-100 dark:border-phdark-800">
            <span>{nextEvent ? `Next: ${nextEvent.date} (${nextEvent.title.split(' ')[0]})` : 'View Full Calendar'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Facility Reservations */}
        <div
          onClick={() => setActiveTab('reservations')}
          className="p-5 rounded-2xl bg-white dark:bg-phdark-900 border border-slate-200 dark:border-phdark-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Facility Requests</span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-gold group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {pendingReservations.length}
            </span>
            <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              Pending Review
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-2 border-t border-slate-100 dark:border-phdark-800">
            <span>{approvedReservations.length} Active Bookings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Audit Activity (Admin) OR Public Venues (Public Viewers) */}
        {userRole === 'admin' ? (
          <div
            onClick={() => setActiveTab('audit')}
            className="p-5 rounded-2xl bg-white dark:bg-phdark-900 border border-slate-200 dark:border-phdark-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Audit Trail</span>
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {auditLogs.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">Actions Logged</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-medium pt-2 border-t border-slate-100 dark:border-phdark-800">
              <span>View Full Trail</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ) : (
          <div
            onClick={() => setActiveTab('reservations')}
            className="p-5 rounded-2xl bg-white dark:bg-phdark-900 border border-slate-200 dark:border-phdark-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Community Venues</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {Object.keys(VENUE_DETAILS).length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">Facilities Available</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-2 border-t border-slate-100 dark:border-phdark-800">
              <span>Reserve a Barangay Venue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )}
      </div>

      {/* Facilities Availability Section */}
      <div className="rounded-2xl bg-white dark:bg-phdark-900 border border-slate-200 dark:border-phdark-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-primary dark:text-blue-400" />
              Barangay Public Venues & Facility Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time reservation availability and capacity overview for official venues
            </p>
          </div>
          <button
            onClick={() => setActiveTab('reservations')}
            className="text-xs font-semibold text-brand-primary dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Manage Reservations
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gym Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-phdark-800 bg-slate-50 dark:bg-phdark-850 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Barangay Gymnasium
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-accent" /> Cantaongon Barangay Complex • Max Cap: {VENUE_DETAILS['Barangay Gymnasium'].capacity} pax
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                  gymStatus.isOccupied
                    ? 'bg-rose-100 text-accent dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${gymStatus.isOccupied ? 'bg-accent' : 'bg-emerald-500'}`} />
                  {gymStatus.isOccupied ? `Occupied (until ${gymStatus.until})` : 'Available Today'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-2">
                {VENUE_DETAILS['Barangay Gymnasium'].description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-phdark-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Hardwood Court • Audio System • Grandstand
              </span>
              <button
                onClick={onOpenNewReservationModal}
                className="px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-navy text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Reserve Gym
              </button>
            </div>
          </div>

          {/* Multipurpose Hall Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-phdark-800 bg-slate-50 dark:bg-phdark-850 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Multipurpose Barangay Hall
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-accent" /> 2nd Floor Main Building • Max Cap: {VENUE_DETAILS['Multipurpose Barangay Hall'].capacity} pax
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                  hallStatus.isOccupied
                    ? 'bg-rose-100 text-accent dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${hallStatus.isOccupied ? 'bg-accent' : 'bg-emerald-500'}`} />
                  {hallStatus.isOccupied ? `Occupied (until ${hallStatus.until})` : 'Available Today'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-2">
                {VENUE_DETAILS['Multipurpose Barangay Hall'].description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-phdark-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Air Conditioned • Projector • Stage & Podium
              </span>
              <button
                onClick={onOpenNewReservationModal}
                className="px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-navy text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Reserve Hall
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Upcoming Schedule & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Upcoming Events */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-phdark-900 border border-slate-200 dark:border-phdark-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-accent" />
                Upcoming Barangay Events
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheduled community initiatives and council gatherings
              </p>
            </div>
            <button
              onClick={() => {
                if (nextEvent) {
                  navigateToEventInCalendar(nextEvent);
                } else {
                  setActiveTab('calendar');
                }
              }}
              className="text-xs font-semibold text-brand-primary dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              See Calendar
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <CalendarCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="font-semibold text-sm">No upcoming events scheduled</p>
                <p className="text-xs mt-1">Events scheduled in the Calendar tab or approved from facility bookings will appear here.</p>
              </div>
            ) : (
              events.slice(0, 4).map(event => {
              // Color tags based on type
              let typeBadgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
              if (event.type === 'Sports League') typeBadgeClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
              if (event.type === 'Health Mission') typeBadgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
              if (event.type === 'Disaster Preparedness') typeBadgeClass = 'bg-rose-100 text-accent dark:bg-rose-900/40 dark:text-rose-300';
              if (event.type === 'Youth & SK Activity') typeBadgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';

              return (
                <div
                  key={event.id}
                  onClick={() => navigateToEventInCalendar(event)}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-phdark-800 hover:border-brand-primary/50 dark:hover:border-blue-500/50 bg-slate-50/50 dark:bg-phdark-850/50 hover:bg-blue-50/20 dark:hover:bg-phdark-800 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${typeBadgeClass}`}>
                        {event.type}
                      </span>
                      {event.sourceReservationId && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent-border dark:border-accent-dark">
                          Synced from Booking
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {event.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3 h-3 text-brand-primary" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {event.startTime} - {event.endTime}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-accent" /> {event.venue}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                      {event.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* Right (1 col): Recent Audit Activity */}
        <div className="rounded-2xl bg-white dark:bg-phdark-900 border border-slate-200 dark:border-phdark-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  Recent Activity Trail
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest system logs & audit entries
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="relative pl-5 text-xs">
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-brand-primary dark:bg-blue-400 ring-4 ring-blue-50 dark:ring-phdark-800" />
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {log.action} • {log.module}
                    </span>
                    <span className="text-[10px] text-slate-400">{log.timestamp.substring(11, 16)}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 leading-snug">
                    {log.details}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">By: {log.actorName}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-phdark-800">
            <button
              onClick={() => setActiveTab('audit')}
              className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-primary dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-phdark-850 rounded-xl transition-colors"
            >
              <span>Open Full Audit Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
