import React, { useRef } from 'react';
import type { FacilityReservation } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, X, ShieldCheck, Landmark } from 'lucide-react';

interface FacilityPermitModalProps {
  reservation: FacilityReservation | null;
  isOpen: boolean;
  onClose: () => void;
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

export const FacilityPermitModal: React.FC<FacilityPermitModalProps> = ({
  reservation,
  isOpen,
  onClose,
}) => {
  const { currentUser } = useApp();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !reservation) return null;

  const handlePrint = () => {
    window.print();
  };

  const permitNumber = `PERMIT-${reservation.referenceNumber || '2026-000'}`;
  const issueDate = reservation.reviewedAt || new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="bg-white dark:bg-phdark-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-phdark-700 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none print:w-full">
        
        {/* Modal Header (Hidden during print) */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-phdark-800 flex items-center justify-between bg-slate-50 dark:bg-phdark-850 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Official Facility Reservation Permit
              </h3>
              <p className="text-[11px] text-slate-500">
                Official Republic of the Philippines Local Government Form
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Permit</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-phdark-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-phdark-950/60 print:bg-white print:p-0 print:overflow-visible">
          
          {/* Printable Sheet (Standard A4 / Letter Styled Form) */}
          <div
            ref={printAreaRef}
            className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-md mx-auto max-w-2xl border-2 border-slate-300 print:border-none print:shadow-none print:p-0 print:max-w-none text-xs leading-relaxed print:text-[11pt]"
            id="barangay-facility-permit"
          >
            {/* LGU Official Letterhead */}
            <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1 relative">
              {/* Official Seal and LGU Emblems */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-brand-primary overflow-hidden shadow-xs shrink-0 bg-white p-0.5">
                  <img
                    src="/barangay-logo.jpg"
                    alt="Barangay Cantaongon Seal"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-slate-600">
                    Republic of the Philippines
                  </p>
                  <p className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-slate-700">
                    Province of Bohol • Municipality of Loon
                  </p>
                  <h1 className="text-base sm:text-lg font-black uppercase text-brand-darkest tracking-tight">
                    BARANGAY CANTAONGON
                  </h1>
                  <p className="text-[11px] font-bold text-brand-primary uppercase tracking-wide">
                    Office of the Sangguniang Barangay
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center bg-slate-50 text-brand-primary shrink-0">
                  <Landmark className="w-6 h-6 text-brand-primary" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>FORM NO. BC-FAC-2026</span>
                <span>COMPLIANT WITH RA 7160</span>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="py-4 text-center space-y-1">
              <div className="inline-block px-4 py-1 rounded-md bg-brand-primary text-white font-black text-xs sm:text-sm uppercase tracking-wider print:bg-slate-900">
                OFFICIAL PERMIT FOR USE OF BARANGAY MULTIPURPOSE FACILITY
              </div>
              <p className="text-[11px] italic text-slate-600 font-medium">
                (Pahintulot sa Paggamit ng Pasilidad ng Barangay)
              </p>
            </div>

            {/* Permit Reference & Date Box */}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 mb-5 font-mono text-[11px]">
              <div>
                <span className="text-slate-500">PERMIT CONTROL NO.: </span>
                <span className="font-black text-brand-primary">{permitNumber}</span>
              </div>
              <div>
                <span className="text-slate-500">DATE ISSUED: </span>
                <span className="font-bold text-slate-800">{issueDate}</span>
              </div>
            </div>

            {/* Official Certification Clause */}
            <p className="mb-4 text-justify font-serif">
              <strong>TO WHOM IT MAY CONCERN:</strong> This is to certify that permission is hereby granted by the Sangguniang Barangay of Cantaongon, Loon, Bohol, to the herein specified permittee to occupy and utilize the multipurpose facility subject to the stipulations and conditions set forth below:
            </p>

            {/* Structured Permittee & Booking Details Table */}
            <div className="border border-slate-300 rounded-xl overflow-hidden mb-5">
              <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50 text-[11px]">
                <div className="p-2.5 font-bold text-slate-600">Applicant / Organization</div>
                <div className="p-2.5 col-span-2 font-black text-slate-900 text-sm">
                  {reservation.organizationName}
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 text-[11px]">
                <div className="p-2.5 font-bold text-slate-600">Authorized Representative</div>
                <div className="p-2.5 col-span-2 font-semibold text-slate-800">
                  {reservation.contactPerson} ({reservation.contactNumber})
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50 text-[11px]">
                <div className="p-2.5 font-bold text-slate-600">Approved Facility / Venue</div>
                <div className="p-2.5 col-span-2 font-black text-brand-primary">
                  {reservation.venue}
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 text-[11px]">
                <div className="p-2.5 font-bold text-slate-600">Reserved Date & Duration</div>
                <div className="p-2.5 col-span-2 font-bold text-slate-900">
                  {reservation.date} • {format12h(reservation.startTime)} to {format12h(reservation.endTime)}
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50 text-[11px]">
                <div className="p-2.5 font-bold text-slate-600">Purpose / Activity</div>
                <div className="p-2.5 col-span-2 font-semibold text-slate-800">
                  {reservation.purpose}
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 text-[11px]">
                <div className="p-2.5 font-bold text-slate-600">Expected Attendance</div>
                <div className="p-2.5 col-span-2 font-bold text-slate-800">
                  {reservation.attendeeEstimate} Persons / Attendees
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-200 text-[11px]">
                <div className="p-2.5 font-bold text-slate-600">Approved Amenities</div>
                <div className="p-2.5 col-span-2 text-slate-700">
                  {reservation.equipmentRequested && reservation.equipmentRequested.length > 0
                    ? reservation.equipmentRequested.join(', ')
                    : 'Standard Facility Lighting & Ventilation'}
                </div>
              </div>
            </div>

            {/* Official Terms & Conditions (Philippine LGU Standard) */}
            <div className="mb-5 space-y-1.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-[10px] leading-normal">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <span>TERMS & GENERAL CONDITIONS OF USE (Mga Alituntunin):</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700">
                <li>
                  <strong>Cleanliness & CLAYGO:</strong> The permittee is strictly required to observe "Clean As You Go". All solid waste and decorations must be cleared immediately after use.
                </li>
                <li>
                  <strong>Public Order & Noise Control:</strong> Observance of peace and order is mandatory. Sound amplification must be kept within reasonable decibel levels and must cease promptly at the scheduled end time.
                </li>
                <li>
                  <strong>Prohibitions:</strong> Gambling, unauthorized possession of alcoholic beverages, illegal substances, and weapons within the barangay premises are strictly prohibited.
                </li>
                <li>
                  <strong>Liability for Damages:</strong> Any breakage, loss, or vandalism of barangay infrastructure, sports equipment, or electronics shall be charged to the permittee.
                </li>
                <li>
                  <strong>Inspection & Tanod Authority:</strong> Barangay Council Officials and Barangay Tanods on duty hold the authority to inspect the premises during the conduct of the activity.
                </li>
              </ol>
            </div>

            {/* Official Remarks */}
            {reservation.adminRemarks && (
              <div className="mb-6 p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 text-[11px]">
                <span className="font-bold text-emerald-900">Secretariat Endorsement / Remarks: </span>
                <span className="italic text-emerald-800 font-medium">"{reservation.adminRemarks}"</span>
              </div>
            )}

            {/* Official Signatures & Seal Block */}
            <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-3 gap-4 text-center text-[10px]">
              {/* Verified By */}
              <div>
                <p className="text-slate-500 mb-8 font-medium">Prepared & Verified by:</p>
                <div className="font-black text-slate-900 text-xs border-b border-slate-400 pb-1">
                  {currentUser.name ? currentUser.name.toUpperCase() : 'AUTHORIZED SECRETARIAT'}
                </div>
                <p className="text-slate-500 mt-0.5">{currentUser.title || 'Barangay Secretariat'}</p>
                <p className="text-[9px] text-slate-400">Barangay Cantaongon, Loon, Bohol</p>
              </div>

              {/* Conforme / Applicant */}
              <div>
                <p className="text-slate-500 mb-8 font-medium">Conforme / Received by:</p>
                <div className="font-black text-slate-900 text-xs border-b border-slate-400 pb-1 truncate">
                  {reservation.contactPerson}
                </div>
                <p className="text-slate-500 mt-0.5">Authorized Permittee</p>
                <p className="text-[9px] text-slate-400">{reservation.organizationName}</p>
              </div>

              {/* Approved By Punong Barangay */}
              <div>
                <p className="text-slate-500 mb-8 font-medium">Approved by:</p>
                <div className="font-black text-slate-900 text-xs border-b border-slate-400 pb-1 text-brand-darkest">
                  {currentUser.title?.toLowerCase().includes('captain') || currentUser.title?.toLowerCase().includes('punong')
                    ? currentUser.name.toUpperCase()
                    : 'OFFICE OF THE PUNONG BARANGAY'}
                </div>
                <p className="text-slate-500 mt-0.5">Punong Barangay</p>
                <p className="text-[9px] text-slate-400">Presiding Officer, Sangguniang Barangay ng Cantaongon</p>
              </div>
            </div>

            {/* Official Dry Seal watermark note */}
            <div className="mt-8 pt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-200">
              <span className="italic">Not valid without official dry seal and signature of the Punong Barangay.</span>
              <span className="font-mono font-bold">[ BARANGAY OFFICIAL DRY SEAL ]</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:px-6 bg-white dark:bg-phdark-900 border-t border-slate-200 dark:border-phdark-800 flex items-center justify-between print:hidden">
          <p className="text-xs text-slate-500">
            Click <strong>Print Official Permit</strong> to print or save as PDF.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-2xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-phdark-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-phdark-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Print Specific CSS override to hide everything else on the page */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #barangay-facility-permit, #barangay-facility-permit * {
            visibility: visible;
          }
          #barangay-facility-permit {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};
