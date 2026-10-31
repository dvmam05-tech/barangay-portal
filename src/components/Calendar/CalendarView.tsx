import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { BarangayEvent, EventType, EventStatus } from '../../types';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Filter,
  CheckCircle2,
  Eye,
  Trash2,
  X,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

interface CalendarViewProps {
  onOpenAddModal: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenAddModal }) => {
  const {
    events,
    deleteEvent,
    setActiveTab,
    userRole,
    calendarDate,
    calendarFocusedEvent,
    setCalendarFocusedEvent,
  } = useApp();

  // Helper to parse YYYY-MM-DD cleanly without timezone offset bugs
  const parseDateStr = (str?: string): Date => {
    if (!str) return new Date(2026, 10, 5);
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  // Calendar view mode: month | week | day
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Active view date: defaults to upcoming event date (e.g. November 2026) or calendarDate
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (calendarDate) return parseDateStr(calendarDate);
    if (events.length > 0) return parseDateStr(events[0].date);
    return new Date(2026, 10, 5); // November 5, 2026
  });

  // Keep calendar view synced with focused event navigation
  useEffect(() => {
    if (calendarDate) {
      setCurrentDate(parseDateStr(calendarDate));
    }
  }, [calendarDate]);

  useEffect(() => {
    if (calendarFocusedEvent) {
      setCurrentDate(parseDateStr(calendarFocusedEvent.date));
      setSelectedEvent(calendarFocusedEvent);
      setCalendarFocusedEvent(null);
    }
  }, [calendarFocusedEvent, setCalendarFocusedEvent]);

  // Filter states
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVenue, setSelectedVenue] = useState<string>('All');

  // Selected day for mobile schedule inspection
  const [selectedDayDateStr, setSelectedDayDateStr] = useState<string>(() => {
    if (calendarDate) return calendarDate;
    if (events.length > 0) return events[0].date;
    return '2026-11-05';
  });

  // Selected event modal state
  const [selectedEvent, setSelectedEvent] = useState<BarangayEvent | null>(null);

  // Month navigation
  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const jumpToToday = () => {
    if (events.length > 0) {
      setCurrentDate(parseDateStr(events[0].date));
    } else {
      setCurrentDate(new Date(2026, 10, 5));
    }
  };

  // Filtered events
  const filteredEvents = events.filter(event => {
    if (selectedType !== 'All' && event.type !== selectedType) return false;
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'Approved') {
        if (event.status !== 'Approved' && event.status !== 'Scheduled') return false;
      } else if (event.status !== selectedStatus) {
        return false;
      }
    }
    if (selectedVenue !== 'All' && event.venue !== selectedVenue) return false;
    return true;
  });

  // Color mapping helper based on Event Type
  const getTypeBadgeStyles = (type: EventType) => {
    switch (type) {
      case 'Official Meeting':
        return 'bg-brand-primary text-white dark:bg-brand-royal dark:text-white border-brand-navy';
      case 'Community Event':
        return 'bg-sky-600 text-white dark:bg-sky-700 dark:text-sky-100 border-sky-800';
      case 'Sports League':
        return 'bg-amber-600 text-white dark:bg-amber-700 dark:text-amber-100 border-amber-800';
      case 'Health Mission':
        return 'bg-emerald-600 text-white dark:bg-emerald-700 dark:text-emerald-100 border-emerald-800';
      case 'Youth & SK Activity':
        return 'bg-purple-600 text-white dark:bg-purple-700 dark:text-purple-100 border-purple-800';
      case 'Disaster Preparedness':
        return 'bg-accent text-white dark:bg-accent dark:text-white border-accent-dark';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  // Status badge styling
  const getStatusBadgeStyles = (status: EventStatus) => {
    switch (status) {
      case 'Approved':
      case 'Scheduled':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 dark:bg-phdark-800 dark:text-slate-300 border-slate-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  // Build days for Month View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthGridDays: { dateStr: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    monthGridDays.push({ dateStr, dayNumber: day, isCurrentMonth: false, isToday: false });
  }

  // Current day string
  const realNow = new Date();
  const todayStr = `${realNow.getFullYear()}-${String(realNow.getMonth() + 1).padStart(2, '0')}-${String(realNow.getDate()).padStart(2, '0')}`;

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isToday = dateStr === todayStr || dateStr === '2026-10-29';
    monthGridDays.push({ dateStr, dayNumber: i, isCurrentMonth: true, isToday });
  }

  // Next month leading days (fill up to 35 or 42 grid cells)
  const remaining = (7 - (monthGridDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    monthGridDays.push({ dateStr, dayNumber: i, isCurrentMonth: false, isToday: false });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month-specific events analysis
  const currentMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const eventsInCurrentMonth = filteredEvents.filter(e => e.date.startsWith(currentMonthKey));
  const otherMonthEvents = filteredEvents.filter(e => !e.date.startsWith(currentMonthKey));

  // Week View calculation
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      date: d,
      dateStr,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      isToday: dateStr === todayStr || dateStr === '2026-10-29',
    };
  });

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-phdark-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-phdark-800 shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-phdark-800 rounded-xl p-1 border border-slate-200 dark:border-phdark-700">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-phdark-700 text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-3 py-1 text-xs font-bold text-brand-primary dark:text-blue-400 hover:bg-white dark:hover:bg-phdark-700 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-phdark-700 text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {monthNames[month]} {year}
              </h2>
              {/* Quick Jump Month Dropdown */}
              <select
                value={`${year}-${month}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setCurrentDate(new Date(y, m, 1));
                }}
                className="text-xs font-bold py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-phdark-800 border border-slate-300 dark:border-phdark-700 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-hidden hover:bg-slate-200 dark:hover:bg-phdark-700 transition-colors"
                title="Jump directly to any month"
              >
                {[-2, -1, 0, 1, 2, 3].map(offset => {
                  const d = new Date(year, month + offset, 1);
                  const optY = d.getFullYear();
                  const optM = d.getMonth();
                  return (
                    <option key={`${optY}-${optM}`} value={`${optY}-${optM}`} className="bg-white dark:bg-phdark-850">
                      {monthNames[optM]} {optY}
                    </option>
                  );
                })}
              </select>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {eventsInCurrentMonth.length} {eventsInCurrentMonth.length === 1 ? 'event' : 'events'} in this month ({filteredEvents.length} total active)
            </p>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-phdark-800 p-1 rounded-xl border border-slate-200 dark:border-phdark-700 text-xs font-semibold">
            {(['month', 'week', 'day'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>

          {/* Add Event Button */}
          {userRole === 'admin' && (
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Smart Quick Jump if Currently Viewed Month has 0 events, but events exist in another month */}
      {viewMode === 'month' && eventsInCurrentMonth.length === 0 && otherMonthEvents.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-phdark-850 dark:to-phdark-800 border-2 border-brand-primary/30 dark:border-blue-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-primary text-white shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                Viewing {monthNames[month]} {year} (0 Events)
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">
                Upcoming event scheduled: <strong className="text-brand-primary dark:text-blue-400">{otherMonthEvents[0].title}</strong> on <span className="font-mono font-bold text-slate-900 dark:text-white">{otherMonthEvents[0].date}</span> ({otherMonthEvents[0].startTime} - {otherMonthEvents[0].endTime}) at {otherMonthEvents[0].venue}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentDate(parseDateStr(otherMonthEvents[0].date))}
            className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-navy text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Jump to {monthNames[parseDateStr(otherMonthEvents[0].date).getMonth()]} {parseDateStr(otherMonthEvents[0].date).getFullYear()}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-phdark-900 rounded-2xl border border-slate-200 dark:border-phdark-800 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold pr-2">
          <Filter className="w-4 h-4 text-brand-primary dark:text-blue-400" />
          <span>Filters:</span>
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-600 dark:text-slate-400">Type:</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="All">All Types</option>
            <option value="Official Meeting">Official Meeting</option>
            <option value="Community Event">Community Event</option>
            <option value="Sports League">Sports League</option>
            <option value="Health Mission">Health Mission</option>
            <option value="Youth & SK Activity">Youth & SK Activity</option>
            <option value="Disaster Preparedness">Disaster Preparedness</option>
          </select>
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-600 dark:text-slate-400">Status:</label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved / Scheduled</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Filter by Venue */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-600 dark:text-slate-400">Venue:</label>
          <select
            value={selectedVenue}
            onChange={e => setSelectedVenue(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="All">All Venues</option>
            <option value="Barangay Gymnasium">Barangay Gymnasium</option>
            <option value="Multipurpose Barangay Hall">Multipurpose Barangay Hall</option>
          </select>
        </div>

        {/* Legend color pills */}
        <div className="ml-auto hidden xl:flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" /> Meeting
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Health
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Sports
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" /> DRRM
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Youth/SK
          </span>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-phdark-900 rounded-2xl border-2 border-slate-300 dark:border-white/30 overflow-hidden shadow-sm">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b-2 border-slate-300 dark:border-white/30 bg-slate-100/90 dark:bg-phdark-850 text-center font-extrabold text-xs text-slate-700 dark:text-slate-200 py-3">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Day Cells Grid with Thickened Outlines */}
          <div className="grid grid-cols-7 auto-rows-fr bg-slate-300 dark:bg-white/30 gap-[2px]">
            {monthGridDays.map((cell, idx) => {
              const dayEvents = filteredEvents.filter(e => e.date === cell.dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayDateStr(cell.dateStr)}
                  className={`min-h-[56px] sm:min-h-[125px] p-1 sm:p-2 flex flex-col justify-between transition-all cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-100/70 dark:bg-phdark-950/70 text-slate-400 dark:text-slate-600'
                      : 'bg-white dark:bg-phdark-900 text-slate-800 dark:text-slate-100 hover:bg-blue-50/30 dark:hover:bg-phdark-850/50'
                  } ${
                    cell.dateStr === selectedDayDateStr
                      ? 'ring-2 sm:ring-[3px] ring-inset ring-brand-primary bg-blue-50/50 dark:bg-brand-navy/40 shadow-xs'
                      : cell.isToday
                      ? 'ring-2 ring-inset ring-amber-500 bg-amber-50/30 dark:bg-amber-950/20'
                      : cell.isCurrentMonth
                      ? 'ring-1 sm:ring-2 ring-inset ring-slate-200 dark:ring-white/20'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                        cell.dateStr === selectedDayDateStr
                          ? 'bg-brand-primary text-white shadow-xs'
                          : cell.isToday
                          ? 'bg-amber-500 text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="hidden sm:inline text-[10px] font-semibold text-slate-400">
                        {dayEvents.length} ev
                      </span>
                    )}
                  </div>

                  {/* Desktop: Full event pills */}
                  <div className="hidden sm:block space-y-1 my-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map(event => {
                      const typeClass = getTypeBadgeStyles(event.type);

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          title={`${event.title} (${event.startTime} - ${event.endTime})`}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate cursor-pointer shadow-2xs hover:opacity-90 transition-opacity ${typeClass}`}
                        >
                          <span className="opacity-90 mr-1">{event.startTime}</span>
                          <span>{event.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentDate(new Date(cell.dateStr));
                          setViewMode('day');
                        }}
                        className="text-[10px] text-brand-primary dark:text-blue-400 font-bold px-1 cursor-pointer hover:underline"
                      >
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Mobile: Clean dots badge so 7 columns look beautiful on phones */}
                  {dayEvents.length > 0 && (
                    <div className="flex sm:hidden items-center justify-center gap-1 mt-0.5">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-accent"
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] font-bold text-accent">+</span>
                      )}
                    </div>
                  )}

                  <div className="h-0.5" />
                </div>
              );
            })}
          </div>

          {/* Mobile Selected Date Schedule Drawer */}
          <div className="sm:hidden border-t-2 border-slate-200 dark:border-phdark-800 p-4 bg-slate-50 dark:bg-phdark-850 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-primary dark:text-blue-400" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Schedule: {selectedDayDateStr}
                </h4>
              </div>
              <span className="text-[10px] font-bold bg-white dark:bg-phdark-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-phdark-700 text-slate-600 dark:text-slate-300">
                {filteredEvents.filter(e => e.date === selectedDayDateStr).length} event(s)
              </span>
            </div>

            {filteredEvents.filter(e => e.date === selectedDayDateStr).length === 0 ? (
              <p className="text-xs text-slate-400 py-2.5 text-center italic bg-white dark:bg-phdark-900 rounded-xl border border-slate-200/60 dark:border-phdark-800">
                No events scheduled on this day. Tap another date above.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredEvents
                  .filter(e => e.date === selectedDayDateStr)
                  .map(event => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-phdark-700 bg-white dark:bg-phdark-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase mb-1 ${getTypeBadgeStyles(event.type)}`}>
                          {event.type}
                        </span>
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {event.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{event.startTime} - {event.endTime}</span>
                          <span>•</span>
                          <span className="truncate">{event.venue}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-brand-primary dark:text-blue-400 bg-brand-lighter/50 dark:bg-brand-navy/30 px-2 py-1 rounded-lg shrink-0">
                        View →
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-phdark-900 rounded-2xl border border-slate-200 dark:border-phdark-800 overflow-x-auto shadow-sm">
          <div className="min-w-[850px]">
            {/* Week Header */}
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-phdark-800 bg-slate-50 dark:bg-phdark-850 text-center text-xs py-2.5 font-bold">
              <div className="text-slate-400">Time</div>
              {weekDays.map(day => (
                <div
                  key={day.dateStr}
                  className={`flex flex-col items-center ${
                    day.isToday ? 'text-brand-primary dark:text-blue-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="uppercase text-[10px]">{day.dayName}</span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    day.isToday ? 'bg-brand-primary text-white' : ''
                  }`}>
                    {day.date.getDate()}
                  </span>
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            <div className="divide-y divide-slate-100 dark:divide-phdark-800">
              {hours.map(hour => {
                const hourStr = `${String(hour).padStart(2, '0')}:00`;

                return (
                  <div key={hour} className="grid grid-cols-8 min-h-[56px] text-xs">
                    <div className="p-2 text-right text-[11px] font-mono text-slate-400 border-r border-slate-100 dark:border-phdark-800">
                      {hourStr}
                    </div>

                    {weekDays.map(day => {
                      // Events falling in this hour slot
                      const slotEvents = filteredEvents.filter(e => {
                        if (e.date !== day.dateStr) return false;
                        const eventStartHour = parseInt(e.startTime.split(':')[0], 10);
                        return eventStartHour === hour;
                      });

                      return (
                        <div
                          key={day.dateStr}
                          className={`p-1 border-r border-slate-100 dark:border-phdark-800 relative hover:bg-blue-50/20 dark:hover:bg-phdark-850/40 ${
                            day.isToday ? 'bg-blue-50/10 dark:bg-phdark-850/20' : ''
                          }`}
                        >
                          {slotEvents.map(event => (
                            <div
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`p-1.5 rounded-lg text-[10px] font-semibold shadow-xs cursor-pointer hover:scale-[1.02] transition-transform ${getTypeBadgeStyles(
                                event.type
                              )}`}
                            >
                              <div className="truncate font-bold">{event.title}</div>
                              <div className="text-[9px] opacity-90 truncate">
                                {event.startTime}-{event.endTime} • {event.venue.split(' ')[0]}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white dark:bg-phdark-900 rounded-2xl border border-slate-200 dark:border-phdark-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-phdark-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed timeline of confirmed bookings and barangay sessions
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredEvents.filter(e => {
              const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
              return e.date === dStr;
            }).length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="font-semibold text-sm">No events scheduled for this day</p>
                <p className="text-xs mt-1">Both the Barangay Gymnasium and Multipurpose Hall are open for reservation.</p>
              </div>
            ) : (
              filteredEvents
                .filter(e => {
                  const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                  return e.date === dStr;
                })
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-phdark-800 bg-slate-50 dark:bg-phdark-850 hover:border-brand-primary dark:hover:border-brand-royal transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${getTypeBadgeStyles(event.type)}`}>
                          {event.type}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyles(event.status)}`}>
                          {event.status}
                        </span>
                        {event.sourceReservationId && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent-border dark:border-accent-dark">
                            Linked Facility Booking
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {event.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1 font-mono font-semibold text-brand-primary dark:text-blue-400">
                          <Clock className="w-3.5 h-3.5" /> {event.startTime} - {event.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-accent" /> {event.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Org: {event.organizer}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                      <button className="text-xs font-semibold text-brand-primary dark:text-blue-400 flex items-center gap-1 hover:underline">
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-phdark-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-phdark-700 shadow-2xl overflow-hidden">
            <div className="p-5 bg-brand-darkest text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getTypeBadgeStyles(selectedEvent.type)}`}>
                    {selectedEvent.type}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {selectedEvent.status}
                  </span>
                </div>
                <h3 className="text-base font-bold leading-tight">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                {selectedEvent.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-phdark-850 border border-slate-200 dark:border-phdark-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Date</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedEvent.date}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Time Slot</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Venue</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedEvent.venue}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Organizer</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedEvent.organizer}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Audience</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedEvent.targetAudience}</p>
                </div>
              </div>

              {selectedEvent.sourceReservationId && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>Origin: Approved Facility Booking</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      setActiveTab('reservations');
                    }}
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    View Reservation Record
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 dark:border-phdark-800 bg-slate-50 dark:bg-phdark-850 flex items-center justify-between">
              {userRole === 'admin' ? (
                <button
                  onClick={() => {
                    deleteEvent(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="text-xs font-semibold text-accent hover:text-accent-dark flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Event</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Public Calendar Entry</span>
              )}

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-navy rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
