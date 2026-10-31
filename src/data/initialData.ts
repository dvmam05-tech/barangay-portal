import type { BarangayEvent, FacilityReservation, BarangayOfficial, CouncilMeeting, AuditLog } from '../types';

export const INITIAL_OFFICIALS: BarangayOfficial[] = [
  {
    id: 'off-1',
    name: 'Hon. Roberto "Jun" M. Santos',
    position: 'Punong Barangay (Barangay Captain)',
    committee: 'Executive / General Governance',
    isVotingMember: true,
    term: '2023 - 2026',
    contactNumber: '+63 917 555 0101',
    avatarColor: 'bg-brand-primary text-white',
  },
  {
    id: 'off-2',
    name: 'Hon. Maria Elena C. Reyes',
    position: 'Barangay Kagawad',
    committee: 'Committee on Budget, Finance & Appropriations',
    isVotingMember: true,
    term: '2023 - 2026',
    contactNumber: '+63 918 555 0102',
    avatarColor: 'bg-blue-600 text-white',
  },
  {
    id: 'off-3',
    name: 'Hon. Arnel G. Fernandez',
    position: 'Barangay Kagawad',
    committee: 'Committee on Peace & Order and Public Safety',
    isVotingMember: true,
    term: '2023 - 2026',
    contactNumber: '+63 919 555 0103',
    avatarColor: 'bg-emerald-600 text-white',
  },
  {
    id: 'off-4',
    name: 'Hon. Teresa D. Dela Cruz',
    position: 'Barangay Kagawad',
    committee: 'Committee on Health, Sanitation & Social Services',
    isVotingMember: true,
    term: '2023 - 2026',
    contactNumber: '+63 920 555 0104',
    avatarColor: 'bg-rose-600 text-white',
  },
  {
    id: 'off-5',
    name: 'Hon. Danilo S. Ramos',
    position: 'Barangay Kagawad',
    committee: 'Committee on Public Works & Infrastructure',
    isVotingMember: true,
    term: '2023 - 2026',
    contactNumber: '+63 921 555 0105',
    avatarColor: 'bg-amber-600 text-white',
  },
  {
    id: 'off-6',
    name: 'Hon. Grace P. Bautista',
    position: 'Barangay Kagawad',
    committee: 'Committee on Education, Culture & Women Welfare',
    isVotingMember: true,
    term: '2023 - 2026',
    contactNumber: '+63 922 555 0106',
    avatarColor: 'bg-indigo-600 text-white',
  },
  {
    id: 'off-7',
    name: 'Hon. Mark Anthony L. Tan',
    position: 'Barangay Kagawad',
    committee: 'Committee on Environmental Protection & DRRM',
    isVotingMember: true,
    term: '2023 - 2026',
    contactNumber: '+63 923 555 0107',
    avatarColor: 'bg-teal-600 text-white',
  },
  {
    id: 'off-8',
    name: 'Hon. Christopher V. Aquino',
    position: 'Barangay Kagawad',
    committee: 'Committee on Transportation, Traffic & Livelihood',
    isVotingMember: true,
    term: '2023 - 2026',
    contactNumber: '+63 924 555 0108',
    avatarColor: 'bg-cyan-600 text-white',
  },
  {
    id: 'off-9',
    name: 'Hon. Bea Marie S. Villanueva',
    position: 'SK Chairperson',
    committee: 'Committee on Youth Affairs & Sports Development',
    isVotingMember: true,
    term: '2023 - 2026',
    contactNumber: '+63 925 555 0109',
    avatarColor: 'bg-pink-600 text-white',
  },
  {
    id: 'off-10',
    name: 'Barangay Secretary Office',
    position: 'Barangay Secretary',
    committee: 'Barangay Secretariat & Documentation',
    isVotingMember: false,
    term: 'Appointed',
    contactNumber: '+63 900 000 0000',
    avatarColor: 'bg-purple-600 text-white',
  },
  {
    id: 'off-11',
    name: 'Engr. Ferdinand T. Mendoza',
    position: 'Barangay Treasurer',
    committee: 'Barangay Treasury & Disbursing',
    isVotingMember: false,
    term: 'Appointed 2023',
    contactNumber: '+63 927 555 0111',
    avatarColor: 'bg-slate-700 text-white',
  },
];

export const INITIAL_RESERVATIONS: FacilityReservation[] = [];

export const INITIAL_EVENTS: BarangayEvent[] = [];

export const INITIAL_MEETINGS: CouncilMeeting[] = [
  {
    id: 'meet-01',
    sessionNumber: 'Session No. 2026-13',
    title: '13th Regular Sangguniang Barangay Session',
    type: 'Regular Session',
    date: '2026-09-04',
    time: '09:00 AM',
    venue: 'Multipurpose Barangay Hall',
    presidingOfficer: 'Hon. Roberto "Jun" M. Santos (Punong Barangay)',
    agenda: [
      'Approval of Minutes of the 12th Regular Session',
      'Ordinance No. 04-2026: Strict Curfew for Unaccompanied Minors',
      'Resolution Allocating Contingency Fund for Monsoon Preparedness',
      'Open Forum on Purok 5 Drainage Rehabilitation'
    ],
    isCompleted: true,
    records: [
      { officialId: 'off-1', status: 'Present', checkInTime: '08:45 AM', checkOutTime: '12:15 PM', remarks: 'Presided session' },
      { officialId: 'off-2', status: 'Present', checkInTime: '08:50 AM', checkOutTime: '12:15 PM', remarks: 'Sponsor of Budget resolution' },
      { officialId: 'off-3', status: 'Present', checkInTime: '08:52 AM', checkOutTime: '12:15 PM' },
      { officialId: 'off-4', status: 'Present', checkInTime: '08:55 AM', checkOutTime: '12:15 PM' },
      { officialId: 'off-5', status: 'Late', checkInTime: '09:25 AM', checkOutTime: '12:15 PM', remarks: 'Attended urgent site inspection in Purok 1' },
      { officialId: 'off-6', status: 'Present', checkInTime: '08:50 AM', checkOutTime: '12:15 PM' },
      { officialId: 'off-7', status: 'Present', checkInTime: '08:48 AM', checkOutTime: '12:15 PM' },
      { officialId: 'off-8', status: 'Absent', remarks: 'Official Leave (Medical appointment)' },
      { officialId: 'off-9', status: 'Present', checkInTime: '08:55 AM', checkOutTime: '12:15 PM' },
      { officialId: 'off-10', status: 'Present', checkInTime: '08:30 AM', checkOutTime: '12:30 PM', remarks: 'Session Secretary / Recorded minutes' },
      { officialId: 'off-11', status: 'Present', checkInTime: '08:40 AM', checkOutTime: '12:20 PM', remarks: 'Presented financial report' },
    ]
  },
  {
    id: 'meet-02',
    sessionNumber: 'Session No. 2026-14',
    title: '14th Regular Sangguniang Barangay Session',
    type: 'Regular Session',
    date: '2026-09-18',
    time: '09:00 AM',
    venue: 'Multipurpose Barangay Hall',
    presidingOfficer: 'Hon. Roberto "Jun" M. Santos (Punong Barangay)',
    agenda: [
      'Call to Order & Roll Call of Members',
      'Consideration of Proposed 2027 Annual Investment Plan (AIP)',
      'Resolution Authorizing Facility Upgrades for Barangay Gymnasium',
      'Committee Report: Peace & Order Status in Purok 4',
      'Adjournment'
    ],
    isCompleted: false,
    records: [
      { officialId: 'off-1', status: 'Present', checkInTime: '08:45 AM' },
      { officialId: 'off-2', status: 'Present', checkInTime: '08:50 AM' },
      { officialId: 'off-3', status: 'Present', checkInTime: '08:52 AM' },
      { officialId: 'off-4', status: 'Present', checkInTime: '08:55 AM' },
      { officialId: 'off-5', status: 'Present', checkInTime: '08:58 AM' },
      { officialId: 'off-6', status: 'Present', checkInTime: '08:50 AM' },
      { officialId: 'off-7', status: 'Present', checkInTime: '08:48 AM' },
      { officialId: 'off-8', status: 'Late', checkInTime: '09:15 AM', remarks: 'Delayed by traffic on Ortigas Ave.' },
      { officialId: 'off-9', status: 'Present', checkInTime: '08:55 AM' },
      { officialId: 'off-10', status: 'Present', checkInTime: '08:30 AM', remarks: 'Taking Official Minutes' },
      { officialId: 'off-11', status: 'Present', checkInTime: '08:40 AM' },
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const VENUE_DETAILS = {
  'Barangay Gymnasium': {
    capacity: 600,
    description: 'Full-sized hardwood court with grandstand, electronic scoreboard, and centralized audio system. Suitable for sports tournaments, assemblies, and town halls.',
    amenities: ['Hardwood Court', 'Electronic Scoreboard', 'Bleachers (600 seats)', 'Locker Rooms', 'Sound System', 'Industrial Fans'],
    rules: 'Proper athletic footwear required. No food or sugary drinks on the playing court. 10:00 PM strict curfew.',
  },
  'Multipurpose Barangay Hall': {
    capacity: 250,
    description: 'Air-conditioned main assembly hall equipped with stage, multi-media projection, sound system, and breakout function rooms.',
    amenities: ['Central Air-conditioning', 'Audio-Visual Projector', 'Stage & Podium', 'Folding Tables & Chairs', 'Restrooms', 'Catering Pantry'],
    rules: 'No smoking or vaping. Clean-as-you-go policy. Garbage segregation strictly enforced.',
  }
};
