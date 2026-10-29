import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserRole,
  UserProfile,
  Venue,
  BarangayEvent,
  FacilityReservation,
  BarangayOfficial,
  CouncilMeeting,
  AuditLog,
  AttendanceStatus,
  AuditModule,
  AuditAction,
} from '../types';
import {
  INITIAL_OFFICIALS,
  INITIAL_RESERVATIONS,
  INITIAL_EVENTS,
  INITIAL_MEETINGS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';
import {
  isSupabaseConfigured,
  supabase,
  fetchActivitiesFromSupabase,
  insertActivityToSupabase,
  updateActivityInSupabase,
  deleteActivityFromSupabase,
} from '../lib/supabase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType?: 'reservation' | 'event';
  conflictDetails?: string;
  conflictingItemName?: string;
  conflictingTime?: string;
}

interface AppContextType {
  // Theme & User
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeTab: 'dashboard' | 'calendar' | 'reservations' | 'audit';
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'reservations' | 'audit') => void;

  // Security & Authentication
  isAdminAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  requestAdminAccess: () => void;
  authenticateAdmin: (pin: string) => boolean;
  lockAdmin: () => void;

  // Events & Calendar
  events: BarangayEvent[];
  addEvent: (event: Omit<BarangayEvent, 'id' | 'createdAt'>) => BarangayEvent;
  updateEvent: (id: string, updates: Partial<BarangayEvent>) => void;
  deleteEvent: (id: string) => void;
  calendarDate: string;
  setCalendarDate: (dateStr: string) => void;
  calendarFocusedEvent: BarangayEvent | null;
  setCalendarFocusedEvent: (event: BarangayEvent | null) => void;
  navigateToEventInCalendar: (event: BarangayEvent) => void;

  // Reservations
  reservations: FacilityReservation[];
  createReservation: (data: Omit<FacilityReservation, 'id' | 'referenceNumber' | 'status' | 'createdAt'>) => { success: boolean; error?: string; reservation?: FacilityReservation };
  approveReservation: (id: string, adminRemarks: string) => void;
  declineReservation: (id: string, reason: string) => void;
  cancelReservation: (id: string) => void;

  // Conflict Engine
  checkConflict: (venue: Venue, date: string, startTime: string, endTime: string, excludeReservationId?: string) => ConflictCheckResult;

  // Attendance
  officials: BarangayOfficial[];
  meetings: CouncilMeeting[];
  currentMeetingId: string;
  setCurrentMeetingId: (id: string) => void;
  updateOfficialAttendance: (meetingId: string, officialId: string, status: AttendanceStatus, remarks?: string) => void;
  recordCheckOut: (meetingId: string, officialId: string) => void;
  createMeeting: (meeting: Omit<CouncilMeeting, 'id' | 'records' | 'isCompleted'>) => CouncilMeeting;
  getQuorumStats: (meetingId: string) => { totalVoting: number; presentVoting: number; hasQuorum: boolean; percentage: number };

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (module: AuditModule, action: AuditAction, details: string, targetId?: string) => void;
  clearAuditLogs: () => void;

  // Feedback & Notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;

  // Database Connection
  isSupabaseConnected: boolean;

  // Active User Profile
  currentUser: UserProfile;
  updateCurrentUser: (profile: UserProfile) => void;

  // Utilities
  resetToDefaultData: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to convert time "HH:mm" to minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

// Helper to get initials from a name (e.g. "Dave Mier" -> "DM", "Hon. Juan Dela Cruz" -> "JC")
export const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'BO';
  const clean = name.replace(/^(Hon\.|Atty\.|Engr\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BO';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('barangay_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // User Role (Dedicated Barangay Admin Console)
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // Security & Authentication: Officials always authenticated
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'reservations' | 'audit'>(() => {
    const saved = localStorage.getItem('barangay_active_tab');
    if (saved === 'calendar' || saved === 'reservations' || saved === 'audit') return saved;
    return 'calendar';
  });

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calendar active view date & focused event
  const [calendarDate, setCalendarDate] = useState<string>('2026-11-05');
  const [calendarFocusedEvent, setCalendarFocusedEvent] = useState<BarangayEvent | null>(null);

  const navigateToEventInCalendar = (event: BarangayEvent) => {
    setActiveTab('calendar');
    setCalendarDate(event.date);
    setCalendarFocusedEvent(event);
  };

  // Primary data states with localStorage backup
  const [events, setEvents] = useState<BarangayEvent[]>(() => {
    const saved = localStorage.getItem('barangay_events');
    if (!saved) return INITIAL_EVENTS;
    try {
      const parsed: BarangayEvent[] = JSON.parse(saved);
      // Strip any example events (evt-201 through evt-207) that were stored in browser cache
      return parsed.filter(e => !e.id.startsWith('evt-20'));
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [reservations, setReservations] = useState<FacilityReservation[]>(() => {
    const saved = localStorage.getItem('barangay_reservations');
    if (!saved) return INITIAL_RESERVATIONS;
    try {
      const parsed: FacilityReservation[] = JSON.parse(saved);
      // Strip any example reservations (res-101 through res-105)
      return parsed.filter(r => !r.id.startsWith('res-10'));
    } catch {
      return INITIAL_RESERVATIONS;
    }
  });

  const [officials] = useState<BarangayOfficial[]>(INITIAL_OFFICIALS);

  // Database Connection (Supabase Cloud PostgreSQL)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Sync Activities with Supabase on mount & listen to live changes
  useEffect(() => {
    let isMounted = true;

    const loadSupabaseActivities = async () => {
      if (!isSupabaseConfigured) return;
      const remoteActivities = await fetchActivitiesFromSupabase();
      if (remoteActivities && isMounted) {
        setEvents(remoteActivities);
        setIsSupabaseConnected(true);
        if (remoteActivities.length > 0) {
          setCalendarDate(remoteActivities[0].date);
        }
        try {
          localStorage.setItem('barangay_events', JSON.stringify(remoteActivities));
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadSupabaseActivities();

    // Subscribe to live database changes
    const channel = supabase
      .channel('realtime:activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        async () => {
          const fresh = await fetchActivitiesFromSupabase();
          if (fresh && isMounted) {
            setEvents(fresh);
            try {
              localStorage.setItem('barangay_events', JSON.stringify(fresh));
            } catch (e) {
              console.error(e);
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Active User Profile (Actual User of the Website)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('barangay_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: '',
      title: 'Barangay Official',
      email: '',
      contactNumber: '',
    };
  });

  const updateCurrentUser = (profile: UserProfile) => {
    setCurrentUser(profile);
    try {
      localStorage.setItem('barangay_current_user', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    addToast({
      type: 'success',
      title: 'Official Profile Saved',
      message: profile.name.trim() 
        ? `Active portal user set to ${profile.name} (${profile.title})` 
        : 'User profile cleared.',
    });
    logAction('System', 'UPDATE', `Active user profile set to: ${profile.name.trim() || 'Official'} (${profile.title})`);
  };

  const [meetings, setMeetings] = useState<CouncilMeeting[]>(() => {
    const saved = localStorage.getItem('barangay_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [currentMeetingId, setCurrentMeetingId] = useState<string>(() => {
    return meetings[1]?.id || meetings[0]?.id || 'meet-02';
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('barangay_audit_logs');
    if (!saved) return INITIAL_AUDIT_LOGS;
    try {
      const parsed: AuditLog[] = JSON.parse(saved);
      // Strip logs that referenced the old example reservations/events
      return parsed.filter(l => !l.targetId?.startsWith('res-10') && !l.targetId?.startsWith('evt-20'));
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('barangay_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('barangay_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Sync states to LocalStorage
  useEffect(() => {
    localStorage.setItem('barangay_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('barangay_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('barangay_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('barangay_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('barangay_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('barangay_active_tab', activeTab);
  }, [activeTab]);

  // Toast dispatch
  const addToast = (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id, timestamp: Date.now() };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Audit logger
  const logAction = (module: AuditModule, action: AuditAction, details: string, targetId?: string) => {
    const actorName = currentUser.name.trim() || 'Barangay Official';
    const actorRole = currentUser.title.trim() || 'Barangay Administration';

    const now = new Date();
    const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: formattedTimestamp,
      actorName,
      actorRole,
      module,
      action,
      details,
      targetId,
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    try {
      localStorage.removeItem('barangay_audit_logs');
    } catch (e) {
      console.error(e);
    }
    addToast({
      type: 'info',
      title: 'Audit Trail Reset',
      message: 'All activity audit logs have been successfully cleared.',
    });
  };

  // Security & Admin Authentication Functions
  const authenticateAdmin = (_pin: string): boolean => {
    setIsAdminAuthenticated(true);
    setUserRole('admin');
    setIsAuthModalOpen(false);
    return true;
  };

  const lockAdmin = () => {
    // Retain admin console
    addToast({
      type: 'info',
      title: 'Barangay Admin Console',
      message: 'Official administration workspace is active.',
    });
  };

  const requestAdminAccess = () => {
    setUserRole('admin');
    setIsAdminAuthenticated(true);
  };

  // Conflict Prevention Engine
  const checkConflict = (
    venue: Venue,
    date: string,
    startTime: string,
    endTime: string,
    excludeReservationId?: string
  ): ConflictCheckResult => {
    const reqStart = timeToMinutes(startTime);
    const reqEnd = timeToMinutes(endTime);

    if (reqStart >= reqEnd) {
      return {
        hasConflict: true,
        conflictDetails: 'End time must be later than start time.',
      };
    }

    // 1. Check against Approved and Pending reservations for the same venue on the same date
    const conflictingReservation = reservations.find(res => {
      if (excludeReservationId && res.id === excludeReservationId) return false;
      if (res.venue !== venue || res.date !== date) return false;
      if (res.status === 'Declined' || res.status === 'Cancelled') return false;

      const resStart = timeToMinutes(res.startTime);
      const resEnd = timeToMinutes(res.endTime);

      // Overlap condition: !(reqEnd <= resStart || reqStart >= resEnd)
      return !(reqEnd <= resStart || reqStart >= resEnd);
    });

    if (conflictingReservation) {
      return {
        hasConflict: true,
        conflictType: 'reservation',
        conflictingItemName: conflictingReservation.organizationName,
        conflictingTime: `${conflictingReservation.startTime} - ${conflictingReservation.endTime}`,
        conflictDetails: `Slot conflicts with ${conflictingReservation.status === 'Approved' ? 'confirmed' : 'pending'} reservation by "${conflictingReservation.organizationName}" (${conflictingReservation.startTime} to ${conflictingReservation.endTime}).`,
      };
    }

    // 2. Check against scheduled Approved Events on the Central Calendar at the same venue
    const conflictingEvent = events.find(evt => {
      if (excludeReservationId && evt.sourceReservationId === excludeReservationId) return false;
      if (evt.venue !== venue || evt.date !== date) return false;
      if (evt.status === 'Cancelled') return false;

      const evtStart = timeToMinutes(evt.startTime);
      const evtEnd = timeToMinutes(evt.endTime);

      return !(reqEnd <= evtStart || reqStart >= evtEnd);
    });

    if (conflictingEvent) {
      return {
        hasConflict: true,
        conflictType: 'event',
        conflictingItemName: conflictingEvent.title,
        conflictingTime: `${conflictingEvent.startTime} - ${conflictingEvent.endTime}`,
        conflictDetails: `Venue is already blocked by official event: "${conflictingEvent.title}" (${conflictingEvent.startTime} to ${conflictingEvent.endTime}).`,
      };
    }

    return { hasConflict: false };
  };

  // Event handlers
  const addEvent = (eventData: Omit<BarangayEvent, 'id' | 'createdAt'>): BarangayEvent => {
    const tempId = 'evt-' + Date.now();
    const newEvent: BarangayEvent = {
      ...eventData,
      id: tempId,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setEvents(prev => [newEvent, ...prev]);
    logAction('Events', 'CREATE', `Scheduled new event: "${newEvent.title}" at ${newEvent.venue} on ${newEvent.date} (${newEvent.startTime}-${newEvent.endTime})`, newEvent.id);
    addToast({
      type: 'success',
      title: 'Event Scheduled',
      message: `"${newEvent.title}" has been saved and placed on the Central Calendar.`,
    });

    // Save to Supabase Cloud Database
    if (isSupabaseConfigured) {
      insertActivityToSupabase(eventData, currentUser.name).then(savedEvent => {
        if (savedEvent) {
          setEvents(prev => prev.map(e => (e.id === tempId ? savedEvent : e)));
        }
      });
    }

    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<BarangayEvent>) => {
    setEvents(prev => prev.map(evt => (evt.id === id ? { ...evt, ...updates } : evt)));
    logAction('Events', 'UPDATE', `Updated event details for ID: ${id}`, id);
    addToast({
      type: 'info',
      title: 'Event Updated',
      message: 'Calendar event information has been successfully modified.',
    });

    // Update in Supabase
    if (isSupabaseConfigured) {
      updateActivityInSupabase(id, updates);
    }
  };

  const deleteEvent = (id: string) => {
    const target = events.find(e => e.id === id);
    setEvents(prev => prev.filter(evt => evt.id !== id));
    logAction('Events', 'DELETE', `Removed event: "${target?.title || id}" from calendar`, id);
    addToast({
      type: 'warning',
      title: 'Event Removed',
      message: 'The event was removed from the calendar schedule.',
    });

    // Delete in Supabase
    if (isSupabaseConfigured) {
      deleteActivityFromSupabase(id);
    }
  };

  // Reservation handlers
  const createReservation = (data: Omit<FacilityReservation, 'id' | 'referenceNumber' | 'status' | 'createdAt'>) => {
    // Conflict check first
    const conflict = checkConflict(data.venue, data.date, data.startTime, data.endTime);
    if (conflict.hasConflict) {
      addToast({
        type: 'error',
        title: 'Booking Conflict Detected',
        message: conflict.conflictDetails || 'The requested venue and time slot is unavailable.',
      });
      return { success: false, error: conflict.conflictDetails };
    }

    const nextNumber = reservations.length + 1;
    const refNum = `RES-2026-${String(nextNumber).padStart(3, '0')}`;
    const newRes: FacilityReservation = {
      ...data,
      id: 'res-' + Date.now(),
      referenceNumber: refNum,
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setReservations(prev => [newRes, ...prev]);
    logAction('Reservations', 'CREATE', `New booking request ${refNum} submitted by ${data.organizationName} for ${data.venue} on ${data.date}`, newRes.id);
    addToast({
      type: 'success',
      title: 'Reservation Request Submitted',
      message: `Reference No: ${refNum}. Your application is queued for Barangay Admin evaluation.`,
    });

    return { success: true, reservation: newRes };
  };

  const approveReservation = (id: string, adminRemarks: string) => {
    const target = reservations.find(r => r.id === id);
    if (!target) return;

    // Check again in case another event was inserted in between
    const conflict = checkConflict(target.venue, target.date, target.startTime, target.endTime, target.id);
    if (conflict.hasConflict) {
      addToast({
        type: 'error',
        title: 'Cannot Approve - Conflict Exists',
        message: conflict.conflictDetails || 'A conflicting event or reservation occupies this time.',
      });
      return;
    }

    const reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const reviewerName = currentUser.name.trim() || 'Barangay Official';
    const reviewerRole = currentUser.title.trim() || 'Administration';
    const reviewedBy = `${reviewerName} (${reviewerRole})`;

    // 1. Update reservation status
    setReservations(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'Approved',
              adminRemarks: adminRemarks || 'Approved according to Barangay Facility Ordinance.',
              reviewedBy,
              reviewedAt,
            }
          : r
      )
    );

    // 2. AUTOMATICALLY LINK TO CENTRAL CALENDAR:
    // Create an approved calendar event derived from this facility reservation!
    const newCalendarEvent: BarangayEvent = {
      id: 'evt-res-' + target.id,
      title: `${target.purpose} (${target.organizationName})`,
      description: `Facility Reservation [${target.referenceNumber}]. Contact: ${target.contactPerson} (${target.contactNumber}). Attendees: ~${target.attendeeEstimate}. Requested: ${target.equipmentRequested.join(', ')}. Remarks: ${adminRemarks || 'Official approval granted.'}`,
      organizer: target.organizationName,
      date: target.date,
      startTime: target.startTime,
      endTime: target.endTime,
      venue: target.venue,
      targetAudience: 'Members and invited guests of ' + target.organizationName,
      type: 'Community Event',
      status: 'Approved',
      sourceReservationId: target.id,
      expectedAttendees: target.attendeeEstimate,
      createdAt: reviewedAt,
    };

    setEvents(prev => [newCalendarEvent, ...prev]);

    // 3. Log into Audit Trail
    logAction(
      'Reservations',
      'APPROVE',
      `Approved facility booking ${target.referenceNumber} for "${target.organizationName}" at ${target.venue}. Linked event synced to Central Calendar.`,
      target.id
    );

    addToast({
      type: 'success',
      title: 'Reservation Approved & Synced',
      message: `${target.referenceNumber} has been approved and automatically posted to the Central Calendar.`,
    });
  };

  const declineReservation = (id: string, reason: string) => {
    const target = reservations.find(r => r.id === id);
    if (!target) return;

    const reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const reviewerName = currentUser.name.trim() || 'Barangay Official';
    const reviewerRole = currentUser.title.trim() || 'Administration';
    const reviewedBy = `${reviewerName} (${reviewerRole})`;

    setReservations(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'Declined',
              adminRemarks: reason || 'Application declined by Barangay Administration.',
              reviewedBy,
              reviewedAt,
            }
          : r
      )
    );

    // If there was a calendar event linked, cancel it
    setEvents(prev => prev.filter(e => e.sourceReservationId !== id));

    logAction('Reservations', 'DECLINE', `Declined reservation ${target.referenceNumber} for "${target.organizationName}". Reason: ${reason}`, target.id);
    addToast({
      type: 'warning',
      title: 'Reservation Declined',
      message: `Reservation ${target.referenceNumber} status marked as Declined.`,
    });
  };

  const cancelReservation = (id: string) => {
    const target = reservations.find(r => r.id === id);
    if (!target) return;

    setReservations(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'Cancelled' } : r))
    );
    setEvents(prev => prev.filter(e => e.sourceReservationId !== id));

    logAction('Reservations', 'CANCEL', `Reservation ${target.referenceNumber} was cancelled by applicant.`, target.id);
    addToast({
      type: 'info',
      title: 'Reservation Cancelled',
      message: `Reference ${target.referenceNumber} has been marked as cancelled.`,
    });
  };

  // Attendance handlers
  const updateOfficialAttendance = (
    meetingId: string,
    officialId: string,
    status: AttendanceStatus,
    remarks?: string
  ) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetOfficial = officials.find(o => o.id === officialId);

    setMeetings(prev =>
      prev.map(meeting => {
        if (meeting.id !== meetingId) return meeting;

        const existingRecordIndex = meeting.records.findIndex(r => r.officialId === officialId);
        let updatedRecords = [...meeting.records];

        if (existingRecordIndex >= 0) {
          const old = updatedRecords[existingRecordIndex];
          updatedRecords[existingRecordIndex] = {
            ...old,
            status,
            checkInTime: (status === 'Present' || status === 'Late') ? (old.checkInTime || currentTime) : undefined,
            remarks: remarks !== undefined ? remarks : old.remarks,
          };
        } else {
          updatedRecords.push({
            officialId,
            status,
            checkInTime: (status === 'Present' || status === 'Late') ? currentTime : undefined,
            remarks,
          });
        }

        return {
          ...meeting,
          records: updatedRecords,
        };
      })
    );

    logAction(
      'Attendance',
      'ROLL_CALL',
      `Marked ${targetOfficial?.name || officialId} as ${status} in ${meetings.find(m => m.id === meetingId)?.title || meetingId}`,
      meetingId
    );

    addToast({
      type: 'info',
      title: 'Attendance Updated',
      message: `${targetOfficial?.name.split(' ')[1] || 'Official'} status updated to ${status}.`,
    });
  };

  const recordCheckOut = (meetingId: string, officialId: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetOfficial = officials.find(o => o.id === officialId);

    setMeetings(prev =>
      prev.map(meeting => {
        if (meeting.id !== meetingId) return meeting;
        return {
          ...meeting,
          records: meeting.records.map(r =>
            r.officialId === officialId ? { ...r, checkOutTime: currentTime } : r
          ),
        };
      })
    );

    logAction('Attendance', 'ROLL_CALL', `Checked out ${targetOfficial?.name || officialId} at ${currentTime}`, meetingId);
    addToast({
      type: 'info',
      title: 'Official Checked Out',
      message: `Check-out time recorded at ${currentTime}.`,
    });
  };

  const createMeeting = (meetingData: Omit<CouncilMeeting, 'id' | 'records' | 'isCompleted'>): CouncilMeeting => {
    const newMeeting: CouncilMeeting = {
      ...meetingData,
      id: 'meet-' + Date.now(),
      isCompleted: false,
      records: officials.map(o => ({
        officialId: o.id,
        status: 'Absent',
      })),
    };

    setMeetings(prev => [newMeeting, ...prev]);
    setCurrentMeetingId(newMeeting.id);

    // Also place this session on the Central Calendar!
    addEvent({
      title: newMeeting.title,
      description: `Official Sangguniang Barangay Session. Agenda: ${newMeeting.agenda.join('; ')}`,
      organizer: 'Sangguniang Barangay Council',
      date: newMeeting.date,
      startTime: '09:00',
      endTime: '12:00',
      venue: newMeeting.venue,
      targetAudience: 'Barangay Council & Constituents',
      type: 'Official Meeting',
      status: 'Approved',
      expectedAttendees: 30,
    });

    logAction('Attendance', 'CREATE', `Created official meeting session: "${newMeeting.title}" on ${newMeeting.date}`, newMeeting.id);
    addToast({
      type: 'success',
      title: 'Session Created',
      message: `${newMeeting.title} created and synced to Central Calendar.`,
    });

    return newMeeting;
  };

  const getQuorumStats = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) {
      return { totalVoting: 9, presentVoting: 0, hasQuorum: false, percentage: 0 };
    }

    const votingOfficials = officials.filter(o => o.isVotingMember);
    const totalVoting = votingOfficials.length; // 9: Captain + 7 Kagawads + SK Chair

    const presentVoting = votingOfficials.filter(vo => {
      const rec = meeting.records.find(r => r.officialId === vo.id);
      return rec && (rec.status === 'Present' || rec.status === 'Late');
    }).length;

    // In Philippine Local Government Code, a majority (more than 50%) constitutes a quorum (at least 5 for a 9-member council)
    const requiredForQuorum = Math.floor(totalVoting / 2) + 1; // 5
    const hasQuorum = presentVoting >= requiredForQuorum;
    const percentage = Math.round((presentVoting / totalVoting) * 100);

    return { totalVoting, presentVoting, hasQuorum, percentage };
  };

  const resetToDefaultData = () => {
    localStorage.removeItem('barangay_events');
    localStorage.removeItem('barangay_reservations');
    localStorage.removeItem('barangay_meetings');
    localStorage.removeItem('barangay_audit_logs');
    localStorage.removeItem('barangay_user_role');
    sessionStorage.removeItem('barangay_admin_auth');
    setEvents(INITIAL_EVENTS);
    setReservations(INITIAL_RESERVATIONS);
    setMeetings(INITIAL_MEETINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentMeetingId('meet-02');
    setUserRole('admin');
    setActiveTab('dashboard');
    localStorage.removeItem('barangay_current_user');
    setCurrentUser({
      name: '',
      title: 'Barangay Official',
      email: '',
      contactNumber: '',
    });
    addToast({
      type: 'info',
      title: 'Data Reset',
      message: 'Workspace data restored to clean state.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        userRole,
        setUserRole,
        isAdminAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        requestAdminAccess,
        authenticateAdmin,
        lockAdmin,
        isSupabaseConnected,
        currentUser,
        updateCurrentUser,
        activeTab,
        setActiveTab,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        calendarDate,
        setCalendarDate,
        calendarFocusedEvent,
        setCalendarFocusedEvent,
        navigateToEventInCalendar,
        reservations,
        createReservation,
        approveReservation,
        declineReservation,
        cancelReservation,
        checkConflict,
        officials,
        meetings,
        currentMeetingId,
        setCurrentMeetingId,
        updateOfficialAttendance,
        recordCheckOut,
        createMeeting,
        getQuorumStats,
        auditLogs,
        logAction,
        clearAuditLogs,
        toasts,
        addToast,
        removeToast,
        resetToDefaultData,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
