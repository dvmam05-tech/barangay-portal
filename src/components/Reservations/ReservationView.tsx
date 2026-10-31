import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { FacilityReservation, Venue } from '../../types';
import {
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  Check,
  X,
  ExternalLink,
  Calendar,
  Building2,
  Search,
  Printer,
} from 'lucide-react';
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

export const ReservationView: React.FC<ReservationViewProps> = ({ onOpenBookingModal }) => {
  const {
    reservations,
    approveReservation,
    declineReservation,
    userRole,
    setActiveTab,
  } = useApp();

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
            Facility Reservations & Permits
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            View booking status, approve pending requests, and generate official printable permits.
          </p>
        </div>

        <button
          onClick={() => onOpenBookingModal()}
          className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-dark text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Book a Facility</span>
        </button>
      </div>

      {/* Quick Status / Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-phdark-900 p-5 rounded-2xl border border-slate-200 dark:border-phdark-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Reservations
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {reservations.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">All recorded requests</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-lighter/50 dark:bg-phdark-800 flex items-center justify-center text-brand-primary dark:text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-phdark-900 p-5 rounded-2xl border border-slate-200 dark:border-phdark-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Pending Review
            </p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {pendingCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting Secretary approval</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-phdark-900 p-5 rounded-2xl border border-slate-200 dark:border-phdark-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Approved & Synced
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {approvedCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Permits issued & on calendar</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* RESERVATIONS RECORD TABLE */}
      <div className="bg-white dark:bg-phdark-900 rounded-3xl border border-slate-200 dark:border-phdark-800 overflow-hidden shadow-sm">
        {/* Table Filter Tabs & Search */}
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
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-primary"
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
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-phdark-600" />
                    <p className="font-semibold">No reservations found in this category.</p>
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/70 dark:hover:bg-phdark-850/50 transition-colors">
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
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {res.date}
                      </p>
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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-phdark-700 transition-colors cursor-pointer"
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
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setDecliningRes(res);
                                setDeclineReason('Schedule conflict.');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer text-xs"
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
                              className="px-2 py-1 rounded-xl bg-brand-lighter/60 dark:bg-brand-navy/40 text-brand-primary dark:text-blue-300 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
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
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-phdark-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
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
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-phdark-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineConfirm}
                className="px-5 py-2 font-bold text-white bg-accent hover:bg-accent-dark rounded-xl cursor-pointer"
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
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-phdark-700 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Booking Details ({inspectingRes.referenceNumber})
              </h3>
              <button onClick={() => setInspectingRes(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <p><strong>Organization:</strong> {inspectingRes.organizationName}</p>
              <p><strong>Contact:</strong> {inspectingRes.contactPerson} ({inspectingRes.contactNumber})</p>
              <p><strong>Facility:</strong> {inspectingRes.venue}</p>
              <p><strong>Date & Time:</strong> {inspectingRes.date} ({format12h(inspectingRes.startTime)} - {format12h(inspectingRes.endTime)})</p>
              <p><strong>Purpose:</strong> {inspectingRes.purpose}</p>
              <p><strong>Equipment:</strong> {inspectingRes.equipmentRequested.join(', ') || 'None'}</p>
              {inspectingRes.adminRemarks && (
                <p><strong>Admin Remarks:</strong> {inspectingRes.adminRemarks}</p>
              )}
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
                className="px-4 py-2 bg-slate-200 dark:bg-phdark-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-phdark-600 transition-colors cursor-pointer"
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
