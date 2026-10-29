import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { Venue } from '../../types';
import { VENUE_DETAILS } from '../../data/initialData';
import {
  X,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVenue?: Venue;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  initialVenue,
  initialDate,
  initialStartTime,
  initialEndTime,
}) => {
  const { createReservation, checkConflict } = useApp();

  const [organizationName, setOrganizationName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [venue, setVenue] = useState<Venue>('Barangay Gymnasium');
  const [date, setDate] = useState('2026-09-22');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [attendeeEstimate, setAttendeeEstimate] = useState(60);
  const [equipmentRequested, setEquipmentRequested] = useState<string[]>([
    'Sound System',
    'Folding Chairs',
  ]);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialVenue) setVenue(initialVenue);
      if (initialDate) setDate(initialDate);
      if (initialStartTime) setStartTime(initialStartTime);
      if (initialEndTime) setEndTime(initialEndTime);
    }
  }, [isOpen, initialVenue, initialDate, initialStartTime, initialEndTime]);

  if (!isOpen) return null;

  // Real-time conflict check
  const conflict = checkConflict(venue, date, startTime, endTime);

  const availableEquipment = [
    'Sound System',
    'Wireless Microphones',
    'Folding Chairs',
    'Projector & Screen',
    'Electronic Scoreboard',
    'Stage & Podium',
    'Industrial Fans',
  ];

  const handleEquipmentToggle = (item: string) => {
    if (equipmentRequested.includes(item)) {
      setEquipmentRequested(equipmentRequested.filter(e => e !== item));
    } else {
      setEquipmentRequested([...equipmentRequested, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflict.hasConflict) return;

    const res = createReservation({
      organizationName,
      contactPerson,
      contactNumber,
      email,
      purpose,
      venue,
      date,
      startTime,
      endTime,
      attendeeEstimate: Number(attendeeEstimate),
      equipmentRequested,
    });

    if (res.success) {
      onClose();
    }
  };

  const venueInfo = VENUE_DETAILS[venue];

  // Quick preset time buttons
  const setQuickTime = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-phdark-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-phdark-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-darkest via-brand-dark to-brand-navy text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-accent text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-brand-light">
                  Public Venue Request
                </span>
                <span className="text-[10px] text-slate-300">Cantaongon, Loon LGU</span>
              </div>
              <h3 className="text-base font-extrabold tracking-tight">Reserve Facility Slot</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Venue & Capacity Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-phdark-850 border border-slate-200 dark:border-phdark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Select Facility
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Barangay Gymnasium', 'Multipurpose Barangay Hall'] as Venue[]).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVenue(v)}
                    className={`px-3 py-2.5 rounded-xl text-left border transition-all ${
                      venue === v
                        ? 'border-brand-primary bg-brand-primary text-white font-bold shadow-sm'
                        : 'border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-700 dark:text-slate-300 hover:border-brand-primary/50'
                    }`}
                  >
                    <p className="text-xs truncate">{v}</p>
                    <p className={`text-[10px] mt-0.5 ${venue === v ? 'text-blue-100' : 'text-slate-400'}`}>
                      Capacity: {VENUE_DETAILS[v].capacity} pax
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time with Preset Shortcuts */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-phdark-850 border border-slate-200 dark:border-phdark-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-primary dark:text-blue-400" />
                Schedule & Time Window
              </h4>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400 mr-1 text-[10px] font-semibold">Quick:</span>
                <button
                  type="button"
                  onClick={() => setQuickTime('08:00', '12:00')}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-phdark-800 border border-slate-200 dark:border-phdark-700 hover:border-brand-primary text-slate-700 dark:text-slate-300 font-medium"
                >
                  Morning
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime('13:00', '17:00')}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-phdark-800 border border-slate-200 dark:border-phdark-700 hover:border-brand-primary text-slate-700 dark:text-slate-300 font-medium"
                >
                  Afternoon
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime('18:00', '21:00')}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-phdark-800 border border-slate-200 dark:border-phdark-700 hover:border-brand-primary text-slate-700 dark:text-slate-300 font-medium"
                >
                  Evening
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Booking Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            {/* Conflict Detection Result */}
            {conflict.hasConflict ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-accent-border dark:border-accent-dark flex items-start gap-2.5 text-accent-dark dark:text-rose-200 animate-slide-in">
                <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Time Conflict Detected:</span>
                  <p className="mt-0.5 leading-relaxed">{conflict.conflictDetails}</p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  Slot is 100% Free! No conflicting bookings for this facility and time window.
                </span>
              </div>
            )}
          </div>

          {/* Applicant & Organization Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Organization or Group Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cantaongon Youth Association"
                value={organizationName}
                onChange={e => setOrganizationName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Authorized Contact Person *
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone / Mobile *
              </label>
              <input
                type="tel"
                required
                placeholder="0917-000-0000"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="representative@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Purpose of Activity / Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Purok Sports Tournament / General Meeting"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expected Pax *
              </label>
              <input
                type="number"
                required
                min={1}
                max={venueInfo.capacity}
                value={attendeeEstimate}
                onChange={e => setAttendeeEstimate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Equipment Checkboxes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Amenities Needed
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableEquipment.map(item => {
                const isSelected = equipmentRequested.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleEquipmentToggle(item)}
                    className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                      isSelected
                        ? 'border-brand-primary bg-brand-lighter/40 dark:bg-brand-navy/30 text-brand-dark dark:text-blue-200 font-semibold shadow-2xs'
                        : 'border-slate-200 dark:border-phdark-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-phdark-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-brand-primary text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-[11px] truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-phdark-800 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              Auto-syncs to Central Calendar upon Admin Approval
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-phdark-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={conflict.hasConflict || !organizationName.trim() || !contactPerson.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit Reservation</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
