import React from 'react';
import { X, BookOpen, ShieldCheck, Calendar, Building2, Users, FileText, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-phdark-900 border border-slate-200 dark:border-phdark-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-phdark-700 flex items-center justify-between bg-brand-darkest text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Barangay Portal User Guide</h3>
              <p className="text-xs text-brand-light">Adherence to Nielsen's Usability Heuristics & Local Operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Quick Overview */}
          <div className="p-4 rounded-xl bg-brand-lighter/50 dark:bg-phdark-800/80 border border-brand-light/40 dark:border-phdark-700">
            <h4 className="font-semibold text-brand-dark dark:text-blue-300 flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-brand-primary dark:text-blue-400" />
              About Barangay Cantaongon Multipurpose Portal
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              This system digitizes local government operations in accordance with the Local Government Code of the Philippines (RA 7160). It coordinates community events, handles facility reservations with automated conflict blocking, and maintains an immutable audit trail.
            </p>
          </div>

          {/* Core Modules Guide */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3">
              Module Quick References
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850">
                <div className="flex items-center gap-2 text-brand-primary dark:text-blue-400 font-medium mb-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Central Calendar</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Interactive Month, Week, and Day views. Color-coded by Event Type (e.g. Health Mission, Sports League, Official Session) and Status. Approved facility reservations automatically appear here.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850">
                <div className="flex items-center gap-2 text-accent font-medium mb-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Facility Reservations</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Book the Barangay Gymnasium or Multipurpose Hall. Real-time conflict engine blocks overlapping requests. When an admin approves a request, it automatically generates a calendar event.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium mb-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Audit Trail (Activity Log)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tracks booking submissions, approvals, cancellations, and calendar modifications with actor timestamp. Filterable by module and exportable as CSV.
                </p>
              </div>
            </div>
          </div>

          {/* Nielsen's Usability Heuristics Implemented */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-2">
              Nielsen's Usability Heuristics Design Highlights
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Visibility of System Status:</strong> Instant toast messages, real-time availability badges, and pending booking indicators.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Match with Real World:</strong> Authentic Philippine barangay terminology (Punong Barangay, Kagawad, SK, Session Hall).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>User Control & Freedom:</strong> Quick cancel buttons, easy status rollbacks, and demo data reset.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Error Prevention:</strong> Real-time booking collision checking prevents double booking before submission.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Flexibility:</strong> Role switcher allows testing both Admin/Secretary workflows and Resident workflows instantly.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Barangay Cantaongon Portal v2.0 • Loon, Bohol</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-navy rounded-lg transition-colors shadow-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
