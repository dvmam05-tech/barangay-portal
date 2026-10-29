import React, { useState, useRef, useEffect } from 'react';
import { useApp, timeToMinutes } from '../../context/AppContext';
import type { FacilityReservation, Venue } from '../../types';
import { VENUE_DETAILS } from '../../data/initialData';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  Check,
  X,
  ExternalLink,
  Calendar,
  Building2,
  Search,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Info,
  Printer,
  Sun,
  SunMedium,
  Moon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FacilityPermitModal } from './FacilityPermitModal';

interface ReservationViewProps {
  onOpenBookingModal: (preset?: {
    venue?: Venue;
    date?: string;
    startTime?: string;
    endTime?: string;
  }) => void;
}

// Helper to format 24h "HH:mm" to 12h "h:mm AM/PM"
const format12h = (time24: string): string => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
};

// Available time choices (30-minute intervals from 8 AM to 9 PM)
const TIME_CHOICES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00'
];

interface CompactTimeSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  getTimeStatus: (val: string) => { isBooked: boolean; bookedBy?: string };
}

// Compact, elegant dropdown with max-height to prevent stretching down the screen
const CompactTimeSelect: React.FC<CompactTimeSelectProps> = ({
  label,
  value,
  onChange,
  getTimeStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentStatus = getTimeStatus(value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>
        {currentStatus.isBooked ? (
          <span className="text-[10px] font-bold text-accent bg-rose-100 dark:bg-rose-950/70 px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Booked
          </span>
        ) : (
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Available
          </span>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-2xl border-2 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-bold text-sm flex items-center justify-between transition-all cursor-pointer ${
          isOpen
            ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-sm'
            : currentStatus.isBooked
            ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
            : 'border-slate-200 dark:border-phdark-700 hover:border-slate-400'
        }`}
      >
        <span className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${currentStatus.isBooked ? 'text-accent' : 'text-brand-primary dark:text-blue-400'}`} />
          <span>{format12h(value)}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-primary' : ''
          }`}
        />
      </button>

      {/* Compact Popover: Capped at max-h-52 with scroll and live availability labels */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-phdark-800 rounded-2xl border-2 border-slate-200 dark:border-phdark-700 shadow-2xl overflow-hidden animate-fade-in w-full min-w-[240px]">
          <div className="px-3 py-2 bg-slate-50 dark:bg-phdark-850 border-b border-slate-100 dark:border-phdark-700 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Time</span>
            <span>Live Availability Status</span>
          </div>

          <div className="max-h-52 overflow-y-auto p-1.5 space-y-1">
            {TIME_CHOICES.map(t => {
              const isSelected = value === t;
              const slotStatus = getTimeStatus(t);

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onChange(t);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-primary text-white shadow-xs'
                      : slotStatus.isBooked
                      ? 'bg-rose-50/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/70'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-phdark-700'
                  }`}
                >
                  <span className="font-mono">{format12h(t)}</span>

                  <div className="flex items-center gap-1.5">
                    {slotStatus.isBooked ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-rose-200 dark:bg-rose-900/60 text-accent-dark dark:text-rose-200'
                      }`}>
                        Booked
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold ${
                        isSelected ? 'text-blue-100' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        Available
                      </span>
                    )}

                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const ReservationView: React.FC<ReservationViewProps> = ({ onOpenBookingModal }) => {
  const {
    reservations,
    events,
    approveReservation,
    declineReservation,
    userRole,
    setActiveTab,
  } = useApp();

  // Selected parameters for the simple checker
  const [selectedVenue, setSelectedVenue] = useState<Venue>('Barangay Gymnasium');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-19');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('12:00');

  // Tab filter: All, Pending, Approved, Declined
  const [activeStatusTab, setActiveStatusTab] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Modals state
  const [approvingRes, setApprovingRes] = useState<FacilityReservation | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [decliningRes, setDecliningRes] = useState<FacilityReservation | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [inspectingRes, setInspectingRes] = useState<FacilityReservation | null>(null);
  const [permitReservation, setPermitReservation] = useState<FacilityReservation | null>(null);

  // Quick preset helper
  const handleQuickPreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  // Helper function to check whether a specific 30-minute time slot point is occupied
  const getTimeSlotStatus = (timeStr: string) => {
    const tMin = timeToMinutes(timeStr);

    // 1. Check reservations
    const resConflict = reservations.find(r => {
      if (r.venue !== selectedVenue || r.date !== selectedDate) return false;
      if (r.status === 'Declined' || r.status === 'Cancelled') return false;
      const s = timeToMinutes(r.startTime);
      const e = timeToMinutes(r.endTime);
      return tMin >= s && tMin < e;
    });

    if (resConflict) {
      return {
        isBooked: true,
        bookedBy: resConflict.organizationName,
        purpose: resConflict.purpose,
        timeSpan: `${format12h(resConflict.startTime)} - ${format12h(resConflict.endTime)}`,
      };
    }

    // 2. Check scheduled calendar events
    const evtConflict = events.find(e => {
      if (e.venue !== selectedVenue || e.date !== selectedDate) return false;
      if (e.status === 'Cancelled') return false;
      const s = timeToMinutes(e.startTime);
      const eMin = timeToMinutes(e.endTime);
      return tMin >= s && tMin < eMin;
    });

    if (evtConflict) {
      return {
        isBooked: true,
        bookedBy: evtConflict.title,
        purpose: evtConflict.description,
        timeSpan: `${format12h(evtConflict.startTime)} - ${format12h(evtConflict.endTime)}`,
      };
    }

    return { isBooked: false };
  };

  // Check occupancy for the entire window selected by the user [startTime, endTime]
  const checkCustomOccupancy = () => {
    const reqStart = timeToMinutes(startTime);
    const reqEnd = timeToMinutes(endTime);

    if (reqStart >= reqEnd) {
      return {
        isInvalid: true,
        message: 'End time must be later than start time.',
      };
    }

    // Check reservations overlap
    const conflictRes = reservations.find(r => {
      if (r.venue !== selectedVenue || r.date !== selectedDate) return false;
      if (r.status === 'Declined' || r.status === 'Cancelled') return false;
      const resStart = timeToMinutes(r.startTime);
      const resEnd = timeToMinutes(r.endTime);
      return !(reqEnd <= resStart || reqStart >= resEnd);
    });

    if (conflictRes) {
      return {
        isOccupied: true,
        orgName: conflictRes.organizationName,
        purpose: conflictRes.purpose,
        time: `${format12h(conflictRes.startTime)} - ${format12h(conflictRes.endTime)}`,
        status: conflictRes.status,
        ref: conflictRes.referenceNumber,
      };
    }

    // Check calendar events overlap
    const conflictEvt = events.find(e => {
      if (e.venue !== selectedVenue || e.date !== selectedDate) return false;
      if (e.status === 'Cancelled') return false;
      const evtStart = timeToMinutes(e.startTime);
      const evtEnd = timeToMinutes(e.endTime);
      return !(reqEnd <= evtStart || reqStart >= evtEnd);
    });

    if (conflictEvt) {
      return {
        isOccupied: true,
        orgName: conflictEvt.organizer || 'Barangay Office',
        purpose: conflictEvt.title,
        time: `${format12h(conflictEvt.startTime)} - ${format12h(conflictEvt.endTime)}`,
        status: conflictEvt.status,
        ref: 'Official Calendar Event',
      };
    }

    return { isOccupied: false };
  };

  const occupancyResult = checkCustomOccupancy();

  // Find all booked blocks on this date and venue to show an at-a-glance summary
  const dayBookedBlocks = [
    ...reservations
      .filter(r => r.venue === selectedVenue && r.date === selectedDate && r.status !== 'Declined' && r.status !== 'Cancelled')
      .map(r => ({
        title: r.organizationName,
        start: r.startTime,
        end: r.endTime,
        status: r.status,
        ref: r.referenceNumber,
      })),
    ...events
      .filter(e => e.venue === selectedVenue && e.date === selectedDate && e.status !== 'Cancelled')
      .map(e => ({
        title: e.title,
        start: e.startTime,
        end: e.endTime,
        status: e.status,
        ref: 'Official Event',
      })),
  ].sort((a, b) => a.start.localeCompare(b.start));

  // Filtered reservations for the table
  const filteredReservations = reservations.filter(res => {
    if (activeStatusTab !== 'All' && res.status !== activeStatusTab) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchOrg = res.organizationName.toLowerCase().includes(q);
      const matchPerson = res.contactPerson.toLowerCase().includes(q);
      const matchPurpose = res.purpose.toLowerCase().includes(q);
      const matchRef = res.referenceNumber.toLowerCase().includes(q);
      if (!matchOrg && !matchPerson && !matchPurpose && !matchRef) return false;
    }
    return true;
  });

  const pendingCount = reservations.filter(r => r.status === 'Pending').length;
  const approvedCount = reservations.filter(r => r.status === 'Approved').length;

  const handleApproveConfirm = () => {
    if (!approvingRes) return;
    approveReservation(approvingRes.id, approvalRemarks);
    setApprovingRes(null);
    setApprovalRemarks('');

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#1a468e', '#dc2626', '#f59e0b', '#2563eb'],
    });
  };

  const handleDeclineConfirm = () => {
    if (!decliningRes) return;
    declineReservation(decliningRes.id, declineReason);
    setDecliningRes(null);
    setDeclineReason('');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Friendly, Simple Top Header */}
      <div className="bg-white dark:bg-phdark-900 p-6 rounded-3xl border border-slate-200 dark:border-phdark-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-brand-primary text-white">
              Barangay Facilities
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Cantaongon, Loon, Bohol
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Facility Reservation & Booking
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Choose your venue, pick your date and time, and check availability instantly.
          </p>
        </div>

        <button
          onClick={() =>
            onOpenBookingModal({
              venue: selectedVenue,
              date: selectedDate,
              startTime,
              endTime,
            })
          }
          className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-dark text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Reservation Form</span>
        </button>
      </div>

      {/* ULTRA-SIMPLE AVAILABILITY & TIME PICKER WITH LIVE AVAILABILITY FEEDBACK */}
      <div className="bg-white dark:bg-phdark-900 rounded-3xl border-2 border-brand-primary/20 dark:border-phdark-800 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-phdark-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-primary dark:text-blue-400" />
              Check Time & Schedule Availability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Available times are highlighted in green, while booked times are marked with a red tag.
            </p>
          </div>
        </div>

        {/* 1. Big Venue Toggle Buttons */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            1. Select Venue (Pumili ng Pasilidad)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedVenue('Barangay Gymnasium')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                selectedVenue === 'Barangay Gymnasium'
                  ? 'border-brand-primary bg-brand-primary text-white shadow-md'
                  : 'border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-800 dark:text-slate-200 hover:border-slate-400'
              }`}
            >
              <div>
                <p className="text-sm font-extrabold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Barangay Gymnasium (Gym)
                </p>
                <p className={`text-xs mt-0.5 ${selectedVenue === 'Barangay Gymnasium' ? 'text-blue-100' : 'text-slate-500'}`}>
                  Hardwood Court • Max 600 Attendees
                </p>
              </div>
              {selectedVenue === 'Barangay Gymnasium' && (
                <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedVenue('Multipurpose Barangay Hall')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                selectedVenue === 'Multipurpose Barangay Hall'
                  ? 'border-brand-primary bg-brand-primary text-white shadow-md'
                  : 'border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-800 dark:text-slate-200 hover:border-slate-400'
              }`}
            >
              <div>
                <p className="text-sm font-extrabold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Multipurpose Barangay Hall
                </p>
                <p className={`text-xs mt-0.5 ${selectedVenue === 'Multipurpose Barangay Hall' ? 'text-blue-100' : 'text-slate-500'}`}>
                  Air-Conditioned Hall • Max 250 Attendees
                </p>
              </div>
              {selectedVenue === 'Multipurpose Barangay Hall' && (
                <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* 2. Date & Schedule Summary Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-phdark-850 border border-slate-200 dark:border-phdark-700 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary dark:text-blue-400" />
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                2. Selected Date: {selectedDate} ({selectedVenue})
              </span>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border-2 border-slate-300 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-bold text-xs focus:border-brand-primary focus:outline-none"
            />
          </div>

          {/* At-a-glance schedule overview for this day */}
          <div className="pt-2 border-t border-slate-200/70 dark:border-phdark-700 text-xs">
            {dayBookedBlocks.length > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span>Already Booked Hours on this Day:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dayBookedBlocks.map((b, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-accent-dark dark:text-rose-200 border border-rose-300 dark:border-rose-900 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{format12h(b.start)} - {format12h(b.end)}: {b.title}</span>
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold pt-0.5">
                  All remaining hours between 8:00 AM and 9:00 PM are available.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs py-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Full Day Available! There are no reservations scheduled on this date.</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Custom Time Dropdowns with Live Availability Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Time with Live Status in each option */}
          <CompactTimeSelect
            label="3. Start Time (Oras ng Simula)"
            value={startTime}
            onChange={setStartTime}
            getTimeStatus={getTimeSlotStatus}
          />

          {/* End Time with Live Status in each option */}
          <CompactTimeSelect
            label="4. End Time (Oras ng Tapos)"
            value={endTime}
            onChange={setEndTime}
            getTimeStatus={getTimeSlotStatus}
          />
        </div>

        {/* Quick Helper Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold text-xs mr-1">Quick time shortcuts:</span>
          <button
            type="button"
            onClick={() => handleQuickPreset('08:00', '12:00')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-800 hover:bg-slate-100 dark:hover:bg-phdark-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Morning (8:00 AM - 12:00 PM)</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('13:00', '17:00')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-800 hover:bg-slate-100 dark:hover:bg-phdark-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <SunMedium className="w-3.5 h-3.5 text-amber-500" />
            <span>Afternoon (1:00 PM - 5:00 PM)</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('18:00', '21:00')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-800 hover:bg-slate-100 dark:hover:bg-phdark-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Evening (6:00 PM - 9:00 PM)</span>
          </button>
        </div>

        {/* 4. BIG CLEAR STATUS BOX */}
        <div className="pt-2">
          {occupancyResult.isInvalid ? (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-800 flex items-center gap-3 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <p className="font-extrabold text-sm">Please Check Your Time Selection</p>
                <p className="text-xs mt-0.5">{occupancyResult.message}</p>
              </div>
            </div>
          ) : occupancyResult.isOccupied ? (
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm uppercase text-accent">
                      NOT AVAILABLE (May Nakareserba Na)
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                    Booked by: <span className="underline">{occupancyResult.orgName}</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Activity: "{occupancyResult.purpose}" • Hours: {occupancyResult.time}
                  </p>
                  <p className="text-[11px] text-accent font-semibold mt-1">
                    Notice: Check the dropdown above to choose times with the green "Available" tag.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span className="px-3.5 py-2 rounded-xl bg-rose-200 dark:bg-rose-900/60 text-accent-dark dark:text-rose-200 text-xs font-black block text-center">
                  Slot Blocked
                </span>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-sm uppercase text-emerald-700 dark:text-emerald-300">
                    AVAILABLE (Pwedeng Gamitin)
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                    <strong>{selectedVenue}</strong> is 100% free on <strong>{selectedDate}</strong> from{' '}
                    <strong>{format12h(startTime)} to {format12h(endTime)}</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onOpenBookingModal({
                    venue: selectedVenue,
                    date: selectedDate,
                    startTime,
                    endTime,
                  })
                }
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Proceed to Book This Time</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RESERVATIONS RECORD TABLE */}
      <div className="bg-white dark:bg-phdark-900 rounded-3xl border border-slate-200 dark:border-phdark-800 overflow-hidden shadow-sm">
        {/* Table Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-phdark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-phdark-850 p-1 rounded-2xl text-xs font-bold">
            {[
              { id: 'All', label: 'All Bookings', count: reservations.length },
              { id: 'Pending', label: 'Pending Review', count: pendingCount },
              { id: 'Approved', label: 'Approved & Synced', count: approvedCount },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeStatusTab === tab.id
                    ? 'bg-white dark:bg-phdark-700 text-brand-primary dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search group name..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 font-medium"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-phdark-850 border-b border-slate-200 dark:border-phdark-800 font-bold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Ref Number</th>
                <th className="py-3.5 px-4">Group / Organization</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Venue</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Date & Time</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-phdark-800">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/70 dark:hover:bg-phdark-850/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-primary dark:text-blue-400 whitespace-nowrap">
                      {res.referenceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{res.organizationName}</p>
                      <p className="text-[11px] text-slate-500">{res.contactPerson} • {res.contactNumber}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {res.venue}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900 dark:text-white">{res.date}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {format12h(res.startTime)} - {format12h(res.endTime)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {res.status === 'Approved' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3 stroke-[3]" /> Approved
                        </span>
                      )}
                      {res.status === 'Pending' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {res.status === 'Declined' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-accent-dark dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 flex items-center gap-1 w-fit">
                          <X className="w-3 h-3" /> Declined
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingRes(res)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {userRole === 'admin' && res.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => {
                                setApprovingRes(res);
                                setApprovalRemarks('Approved per Barangay Venue Ordinance.');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setDecliningRes(res);
                                setDeclineReason('Schedule conflict.');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {res.status === 'Approved' && (
                          <>
                            <button
                              onClick={() => setPermitReservation(res)}
                              title="View and Print Official Facility Permit"
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 text-[11px] border border-emerald-200 dark:border-emerald-800 cursor-pointer shadow-2xs transition-all"
                            >
                              <Printer className="w-3 h-3 text-emerald-600" />
                              <span>Permit</span>
                            </button>
                            <button
                              onClick={() => setActiveTab('calendar')}
                              className="px-2 py-1 rounded-xl bg-brand-lighter/60 dark:bg-brand-navy/40 text-brand-primary dark:text-blue-300 font-bold hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <span>Calendar</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPROVAL MODAL */}
      {approvingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-phdark-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-phdark-700 shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Approve Reservation
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Approve <strong>{approvingRes.organizationName}</strong> for{' '}
              <strong>{approvingRes.venue}</strong> on <strong>{approvingRes.date}</strong>?
            </p>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admin Note / Remarks
              </label>
              <textarea
                rows={2}
                value={approvalRemarks}
                onChange={e => setApprovalRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setApprovingRes(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECLINE MODAL */}
      {decliningRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-phdark-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-phdark-700 shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Decline Reservation
            </h3>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                rows={2}
                required
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDecliningRes(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineConfirm}
                className="px-5 py-2 font-bold text-white bg-accent hover:bg-accent-dark rounded-xl"
              >
                Decline Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {inspectingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-phdark-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-phdark-700 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Booking Details ({inspectingRes.referenceNumber})
              </h3>
              <button onClick={() => setInspectingRes(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <p><strong>Organization:</strong> {inspectingRes.organizationName}</p>
              <p><strong>Contact:</strong> {inspectingRes.contactPerson} ({inspectingRes.contactNumber})</p>
              <p><strong>Facility:</strong> {inspectingRes.venue}</p>
              <p><strong>Date & Time:</strong> {inspectingRes.date} ({format12h(inspectingRes.startTime)} - {format12h(inspectingRes.endTime)})</p>
              <p><strong>Purpose:</strong> {inspectingRes.purpose}</p>
              <p><strong>Equipment:</strong> {inspectingRes.equipmentRequested.join(', ')}</p>
            </div>
            <div className="pt-2 flex items-center justify-between gap-2">
              {inspectingRes.status === 'Approved' ? (
                <button
                  onClick={() => {
                    const r = inspectingRes;
                    setInspectingRes(null);
                    setPermitReservation(r);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>View Official Permit</span>
                </button>
              ) : <div />}
              <button
                onClick={() => setInspectingRes(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-phdark-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-phdark-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Facility Permit Modal */}
      <FacilityPermitModal
        reservation={permitReservation}
        isOpen={!!permitReservation}
        onClose={() => setPermitReservation(null)}
      />
    </div>
  );
};
