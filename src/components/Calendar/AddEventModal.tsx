import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventType, Venue, EventStatus } from '../../types';
import { X, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose }) => {
  const { addEvent, checkConflict, userRole } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState('Barangay Council (Sangguniang Barangay)');
  const [date, setDate] = useState('2026-09-24');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [venue, setVenue] = useState<Venue>('Barangay Gymnasium');
  const [targetAudience, setTargetAudience] = useState('General Barangay Residents & Constituents');
  const [type, setType] = useState<EventType>('Community Event');
  const [status, setStatus] = useState<EventStatus>('Approved');
  const [expectedAttendees, setExpectedAttendees] = useState(100);

  if (!isOpen || userRole !== 'admin') return null;

  // Live conflict evaluation
  const conflict = checkConflict(venue, date, startTime, endTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflict.hasConflict) return;

    addEvent({
      title,
      description,
      organizer,
      date,
      startTime,
      endTime,
      venue,
      targetAudience,
      type,
      status,
      expectedAttendees: Number(expectedAttendees),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-phdark-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-phdark-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-brand-darkest text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Create New Calendar Event</h3>
              <p className="text-[11px] text-brand-light">Schedule official sessions, community programs & activities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Purok 1 Clean-Up & Anti-Dengue Operation"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Event Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as EventType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white font-medium"
              >
                <option value="Official Meeting">Official Meeting</option>
                <option value="Community Event">Community Event</option>
                <option value="Sports League">Sports League</option>
                <option value="Health Mission">Health Mission</option>
                <option value="Youth & SK Activity">Youth & SK Activity</option>
                <option value="Disaster Preparedness">Disaster Preparedness</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Venue *
              </label>
              <select
                value={venue}
                onChange={e => setVenue(e.target.value as Venue)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white font-medium"
              >
                <option value="Barangay Gymnasium">Barangay Gymnasium</option>
                <option value="Multipurpose Barangay Hall">Multipurpose Barangay Hall</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white font-medium"
              >
              </input>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Conflict Warning or Clear Status */}
          {conflict.hasConflict ? (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-accent-border dark:border-accent-dark flex items-start gap-2.5 text-accent-dark dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Venue Scheduling Collision:</span>
                <p className="mt-0.5 leading-relaxed">{conflict.conflictDetails}</p>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Venue slot is completely free. No conflicts detected.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Organizer / Department *
              </label>
              <input
                type="text"
                required
                value={organizer}
                onChange={e => setOrganizer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Audience / Beneficiaries
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description & Objectives
            </label>
            <textarea
              rows={2}
              placeholder="Provide event overview, program agenda, or requirements..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-900 dark:text-white font-medium"
            />
          </div>

          {/* Footer controls */}
          <div className="pt-3 border-t border-slate-100 dark:border-phdark-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-phdark-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={conflict.hasConflict || !title.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-navy disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
            >
              Post to Calendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
