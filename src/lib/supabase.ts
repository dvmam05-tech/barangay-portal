import { createClient } from '@supabase/supabase-js';
import type { BarangayEvent, EventType, EventStatus, Venue } from '../types';

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
