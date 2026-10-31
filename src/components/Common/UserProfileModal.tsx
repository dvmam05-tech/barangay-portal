import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp, getInitials } from '../../context/AppContext';
import { X, User, ShieldCheck, Check, RotateCcw, Award, ChevronDown } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STANDARD_POSITIONS = [
  'Punong Barangay (Barangay Captain)',
  'Barangay Secretary',
  'Barangay Kagawad',
  'Barangay Treasurer',
  'SK Chairperson',
  'Barangay Administrator',
  'Executive Secretariat',
  'Barangay Record Officer / Clerk',
  'Other / Custom Position',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUser } = useApp();

  const [name, setName] = useState('');
  const [title, setTitle] = useState('Barangay Secretary');
  const [isCustomPosition, setIsCustomPosition] = useState(false);
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Sync state whenever modal opens or currentUser changes
  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name || '');
      const userTitle = currentUser.title || 'Barangay Secretary';
      setTitle(userTitle);
      const isStandard = STANDARD_POSITIONS.slice(0, -1).includes(userTitle);
      setIsCustomPosition(!isStandard && !!userTitle && userTitle !== 'Barangay Secretary');
      setEmail(currentUser.email || '');
      setContactNumber(currentUser.contactNumber || '');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: name.trim(),
      title: title.trim() || 'Barangay Secretary',
      email: email.trim(),
      contactNumber: contactNumber.trim(),
    });
    onClose();
  };

  const handleClear = () => {
    setName('');
    setTitle('Barangay Secretary');
    setIsCustomPosition(false);
    setEmail('');
    setContactNumber('');
    updateCurrentUser({
      name: '',
      title: 'Barangay Secretary',
      email: '',
      contactNumber: '',
    });
    onClose();
  };

  const currentInitials = getInitials(name);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-phdark-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-phdark-800 overflow-hidden my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-darkest via-brand-dark to-brand-navy text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-gold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Barangay Secretary Profile</h3>
              <p className="text-xs text-slate-300">Cloud-synced identity. Automatically shares across all your devices.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Real-time Badge Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-phdark-800/60 border border-slate-200 dark:border-phdark-700/60 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0 border-2 border-gold/40">
              {currentInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-light dark:bg-brand-navy text-brand-darkest dark:text-blue-200">
                  Active User Preview
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {name.trim() || 'No name set yet'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {title.trim() || 'Barangay Official'}
              </p>
            </div>
          </div>

          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Official Full Name <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hon. Juan M. Dela Cruz, or Dave Mier"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Your name will appear as the signatory on permits, reservation approvals, and audit trails.
            </p>
          </div>

          {/* Position / Official Title Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Position / Official Title <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Award className="w-4 h-4" />
              </div>
              <select
                value={isCustomPosition ? 'Other / Custom Position' : title}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Other / Custom Position') {
                    setIsCustomPosition(true);
                    if (STANDARD_POSITIONS.includes(title)) {
                      setTitle('');
                    }
                  } else {
                    setIsCustomPosition(false);
                    setTitle(val);
                  }
                }}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-primary cursor-pointer appearance-none"
              >
                {STANDARD_POSITIONS.map((pos) => (
                  <option key={pos} value={pos} className="bg-white dark:bg-phdark-850 text-slate-900 dark:text-white">
                    {pos}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {isCustomPosition && (
              <div className="mt-2.5 animate-fade-in">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Specify official title (e.g. Chief Tanod, Committee Head)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Optional Contact Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Official Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="secretary@cantaongon.gov.ph"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Contact Number (Optional)
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-phdark-700 bg-white dark:bg-phdark-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-phdark-800 flex items-center justify-between gap-3">
            {currentUser.name ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset User</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-phdark-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-phdark-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Official User</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
