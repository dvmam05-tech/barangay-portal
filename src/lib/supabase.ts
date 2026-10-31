import { createClient } from '@supabase/supabase-js';
import type { BarangayEvent, EventType, EventStatus, Venue, FacilityReservation, ReservationStatus } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fukitggodloawskrjkjx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_OkvjZJUCGoJT7Y332lMrEQ_RNEEuiZy';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseActivityRow {
  id: string;
  title: string;
  description: string | null;
  activity_type: string;
  activity_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  organizer: string;
  target_audience: string;
  expected_attendees: number;
  status: string;
  budget_allocated: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Convert Supabase DB row to App BarangayEvent
export const activityToEvent = (row: SupabaseActivityRow): BarangayEvent => {
  // Format HH:mm:ss to HH:mm
  const formatTime = (t: string) => (t && t.length >= 5 ? t.substring(0, 5) : t || '08:00');

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    organizer: row.organizer,
    date: row.activity_date,
    startTime: formatTime(row.start_time),
    endTime: formatTime(row.end_time),
    venue: (row.venue as Venue) || 'Barangay Gymnasium',
    targetAudience: row.target_audience || 'All Residents',
    type: (row.activity_type as EventType) || 'Community Event',
    status: (row.status as EventStatus) || 'Approved',
    expectedAttendees: row.expected_attendees || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
};

// Convert App BarangayEvent to Supabase DB row payload
export const eventToActivityPayload = (
  event: Omit<BarangayEvent, 'id' | 'createdAt'> & { id?: string },
  createdBy?: string
) => {
  const formatTimeWithSeconds = (t: string) => {
    if (!t) return '08:00:00';
    return t.length === 5 ? `${t}:00` : t;
  };

  return {
    ...(event.id ? { id: event.id } : {}),
    title: event.title,
    description: event.description || '',
    activity_type: event.type || 'Community Event',
    activity_date: event.date,
    start_time: formatTimeWithSeconds(event.startTime),
    end_time: formatTimeWithSeconds(event.endTime),
    venue: event.venue,
    organizer: event.organizer,
    target_audience: event.targetAudience || 'All Residents',
    expected_attendees: event.expectedAttendees || 0,
    status: event.status || 'Scheduled',
    created_by: createdBy || 'Barangay Administration',
  };
};

// Supabase API Helpers
export const fetchActivitiesFromSupabase = async (): Promise<BarangayEvent[] | null> => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('activity_date', { ascending: true });

    if (error) {
      console.error('Failed to fetch activities from Supabase:', error);
      return null;
    }

    return (data as SupabaseActivityRow[]).map(activityToEvent);
  } catch (err) {
    console.error('Supabase connection error:', err);
    return null;
  }
};

export const insertActivityToSupabase = async (
  event: Omit<BarangayEvent, 'id' | 'createdAt'>,
  createdBy?: string
): Promise<BarangayEvent | null> => {
  try {
    const payload = eventToActivityPayload(event, createdBy);
    const { data, error } = await supabase
      .from('activities')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Failed to insert activity to Supabase:', error);
      return null;
    }

    return activityToEvent(data as SupabaseActivityRow);
  } catch (err) {
    console.error('Supabase insert error:', err);
    return null;
  }
};

export const updateActivityInSupabase = async (
  id: string,
  updates: Partial<BarangayEvent>
): Promise<boolean> => {
  try {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.date !== undefined) payload.activity_date = updates.date;
    if (updates.startTime !== undefined) {
      payload.start_time = updates.startTime.length === 5 ? `${updates.startTime}:00` : updates.startTime;
    }
    if (updates.endTime !== undefined) {
      payload.end_time = updates.endTime.length === 5 ? `${updates.endTime}:00` : updates.endTime;
    }
    if (updates.venue !== undefined) payload.venue = updates.venue;
    if (updates.organizer !== undefined) payload.organizer = updates.organizer;
    if (updates.type !== undefined) payload.activity_type = updates.type;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.targetAudience !== undefined) payload.target_audience = updates.targetAudience;
    if (updates.expectedAttendees !== undefined) payload.expected_attendees = updates.expectedAttendees;

    payload.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('activities')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Failed to update activity in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase update error:', err);
    return false;
  }
};

export const deleteActivityFromSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete activity from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete error:', err);
    return false;
  }
};

// ==========================================
// RESERVATIONS & FACILITY PERMITS (SUPABASE)
// ==========================================

export interface SupabaseReservationRow {
  id: string;
  reference_number: string;
  organization_name: string;
  contact_person: string;
  contact_number: string;
  email: string;
  purpose: string;
  venue: string;
  date: string;
  start_time: string;
  end_time: string;
  attendee_estimate: number;
  equipment_requested: string[] | string | null;
  status: string;
  admin_remarks: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export const rowToReservation = (row: SupabaseReservationRow): FacilityReservation => {
  const formatTime = (t: string) => (t && t.length >= 5 ? t.substring(0, 5) : t || '08:00');

  let equipment: string[] = [];
  if (Array.isArray(row.equipment_requested)) {
    equipment = row.equipment_requested;
  } else if (typeof row.equipment_requested === 'string') {
    try {
      const parsed = JSON.parse(row.equipment_requested);
      equipment = Array.isArray(parsed) ? parsed : [];
    } catch {
      equipment = row.equipment_requested.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  return {
    id: String(row.id),
    referenceNumber: row.reference_number,
    organizationName: row.organization_name,
    contactPerson: row.contact_person,
    contactNumber: row.contact_number,
    email: row.email,
    purpose: row.purpose,
    venue: (row.venue as Venue) || 'Barangay Gymnasium',
    date: row.date,
    startTime: formatTime(row.start_time),
    endTime: formatTime(row.end_time),
    attendeeEstimate: row.attendee_estimate || 1,
    equipmentRequested: equipment,
    status: (row.status as ReservationStatus) || 'Pending',
    adminRemarks: row.admin_remarks || undefined,
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
};

export const reservationToRowPayload = (
  res: Omit<FacilityReservation, 'id' | 'createdAt'> & { id?: string }
) => {
  const formatTimeWithSeconds = (t: string) => {
    if (!t) return '08:00:00';
    return t.length === 5 ? `${t}:00` : t;
  };

  return {
    ...(res.id ? { id: res.id } : {}),
    reference_number: res.referenceNumber,
    organization_name: res.organizationName,
    contact_person: res.contactPerson,
    contact_number: res.contactNumber,
    email: res.email,
    purpose: res.purpose,
    venue: res.venue,
    date: res.date,
    start_time: formatTimeWithSeconds(res.startTime),
    end_time: formatTimeWithSeconds(res.endTime),
    attendee_estimate: res.attendeeEstimate,
    equipment_requested: res.equipmentRequested || [],
    status: res.status || 'Pending',
    admin_remarks: res.adminRemarks || null,
    reviewed_by: res.reviewedBy || null,
    reviewed_at: res.reviewedAt || null,
  };
};

export const fetchReservationsFromSupabase = async (): Promise<FacilityReservation[] | null> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase reservations fetch notice:', error.message);
      return null;
    }

    return (data as SupabaseReservationRow[]).map(rowToReservation);
  } catch (err) {
    console.warn('Supabase reservations connection error:', err);
    return null;
  }
};

export const insertReservationToSupabase = async (
  res: FacilityReservation
): Promise<FacilityReservation | null> => {
  try {
    const payload = reservationToRowPayload(res);
    const { data, error } = await supabase
      .from('reservations')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Failed to insert reservation to Supabase:', error);
      return null;
    }

    return rowToReservation(data as SupabaseReservationRow);
  } catch (err) {
    console.error('Supabase insert reservation error:', err);
    return null;
  }
};

export const updateReservationInSupabase = async (
  id: string,
  updates: Partial<FacilityReservation>
): Promise<boolean> => {
  try {
    const payload: Record<string, unknown> = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.adminRemarks !== undefined) payload.admin_remarks = updates.adminRemarks;
    if (updates.reviewedBy !== undefined) payload.reviewed_by = updates.reviewedBy;
    if (updates.reviewedAt !== undefined) payload.reviewed_at = updates.reviewedAt;

    const { error } = await supabase
      .from('reservations')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Failed to update reservation in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase update reservation error:', err);
    return false;
  }
};

export const deleteReservationFromSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete reservation from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete reservation error:', err);
    return false;
  }
};
