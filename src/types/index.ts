export type UserRole = 'admin' | 'resident';

export interface UserProfile {
  name: string;
  title: string;
  email?: string;
  contactNumber?: string;
}

export type Venue = 
  | 'Barangay Gymnasium' 
  | 'Multipurpose Barangay Hall' 
  | 'Session Hall' 
  | 'Covered Basketball Court';

export type EventType = 
  | 'Official Meeting' 
  | 'Community Event' 
  | 'Sports League' 
  | 'Health Mission' 
  | 'Youth & SK Activity' 
  | 'Disaster Preparedness';

export type EventStatus = 
  | 'Pending' 
  | 'Approved' 
  | 'Completed' 
  | 'Cancelled'
  | 'Scheduled';

export interface BarangayEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: Venue;
  targetAudience: string;
  type: EventType;
  status: EventStatus;
  sourceReservationId?: string;
  expectedAttendees?: number;
  createdAt: string;
}

export type ReservationStatus = 
  | 'Pending' 
  | 'Approved' 
  | 'Declined' 
  | 'Cancelled';

export interface FacilityReservation {
  id: string;
  referenceNumber: string;
  organizationName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  purpose: string;
  venue: Venue;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  attendeeEstimate: number;
  equipmentRequested: string[];
  status: ReservationStatus;
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface BarangayOfficial {
  id: string;
  name: string;
  position: string;
  committee?: string;
  isVotingMember: boolean; // Punong Barangay, 7 Kagawads, SK Chairperson are voting members (9 total)
  term: string;
  contactNumber: string;
  avatarColor: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Excused';

export interface OfficialAttendanceRecord {
  officialId: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
}

export interface CouncilMeeting {
  id: string;
  sessionNumber: string;
  title: string;
  type: 'Regular Session' | 'Special Session' | 'Committee Hearing' | 'Emergency Assembly';
  date: string; // YYYY-MM-DD
  time: string;
  venue: Venue;
  calendarEventId?: string;
  records: OfficialAttendanceRecord[];
  agenda: string[];
  presidingOfficer: string;
  isCompleted: boolean;
}

export type AuditModule = 'Events' | 'Reservations' | 'Attendance' | 'System';

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'APPROVE' 
  | 'DECLINE' 
  | 'CANCEL' 
  | 'ROLL_CALL' 
  | 'DELETE' 
  | 'EXPORT';

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  module: AuditModule;
  action: AuditAction;
  details: string;
  targetId?: string;
}
