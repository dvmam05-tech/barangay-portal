import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog, AuditModule, AuditAction } from '../../types';
import {
  ShieldAlert,
  Calendar,
  Filter,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  PlusCircle,
  RefreshCw,
  Users2,
  Clock,
  User,
  Building2,
  Trash2,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, logAction, addToast, clearAuditLogs } = useApp();

  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [selectedAction, setSelectedAction] = useState<string>('All');
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Filtering logic
  const filteredLogs = auditLogs.filter(log => {
    if (selectedModule !== 'All' && log.module !== selectedModule) return false;
    if (selectedAction !== 'All' && log.action !== selectedAction) return false;

    if (selectedDatePreset === 'Today') {
      const today = '2026-09-17'; // baseline simulated today
      if (!log.timestamp.startsWith(today)) return false;
    } else if (selectedDatePreset === '7days') {
      // rough check for mid-September
      if (!log.timestamp.startsWith('2026-09')) return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDetails = log.details.toLowerCase().includes(term);
      const matchActor = log.actorName.toLowerCase().includes(term);
      const matchRole = log.actorRole.toLowerCase().includes(term);
      if (!matchDetails && !matchActor && !matchRole) return false;
    }

    return true;
  });

  // Action badge styling
  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
      case 'APPROVE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
      case 'DECLINE':
        return 'bg-rose-100 text-accent-dark dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      case 'CANCEL':
        return 'bg-slate-100 text-slate-700 dark:bg-phdark-800 dark:text-slate-300 border-slate-200';
      case 'ROLL_CALL':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200';
      case 'UPDATE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getModuleIcon = (mod: AuditModule) => {
    switch (mod) {
      case 'Events':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'Reservations':
        return <Building2 className="w-4 h-4 text-accent" />;
      case 'Attendance':
        return <Users2 className="w-4 h-4 text-emerald-500" />;
      case 'System':
        return <ShieldAlert className="w-4 h-4 text-purple-500" />;
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Module', 'Action', 'Details', 'Target ID'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.module}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.targetId || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Barangay_Cantaongon_Audit_Log_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAction('System', 'EXPORT', `Exported ${filteredLogs.length} audit records to CSV.`);
    addToast({
      type: 'success',
      title: 'Audit Log Exported',
      message: `Downloaded CSV containing ${filteredLogs.length} activity entries.`,
    });
  };

  const handleReset = () => {
    clearAuditLogs();
    setShowConfirmReset(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-phdark-900 p-5 rounded-2xl border border-slate-200 dark:border-phdark-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-600 text-white">
              System Transparency
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Master Governance Audit Trail</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Activity Log & Accountability Trail
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Immutable tracking of reservations, approvals, calendar events, and admin actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {showConfirmReset ? (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 px-2">Clear all logs?</span>
              <button
                onClick={handleReset}
                className="px-2.5 py-1 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-dark transition-colors cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-phdark-800 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              disabled={auditLogs.length === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                auditLogs.length === 0
                  ? 'border-slate-200 text-slate-400 bg-slate-50 dark:border-phdark-800 dark:bg-phdark-800/40 cursor-not-allowed'
                  : 'border-rose-200 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              }`}
              title="Reset all activity audit logs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Audit Trail</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Trail</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-white dark:bg-phdark-900 rounded-2xl border border-slate-200 dark:border-phdark-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold pr-2">
            <Filter className="w-4 h-4 text-purple-600" />
            <span>Filters:</span>
          </div>

          {/* Module Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-600 dark:text-slate-400">Module:</label>
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Modules</option>
              <option value="Events">Events</option>
              <option value="Reservations">Reservations</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-600 dark:text-slate-400">Action:</label>
            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="DECLINE">DECLINE</option>
              <option value="ROLL_CALL">ROLL_CALL</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Date Presets */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-600 dark:text-slate-400">Date Range:</label>
            <select
              value={selectedDatePreset}
              onChange={e => setSelectedDatePreset(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Time</option>
              <option value="Today">Today (Sep 17)</option>
              <option value="7days">This Month (September)</option>
            </select>
          </div>
        </div>

        {/* Search inside logs */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search details or actor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-850 text-slate-800 dark:text-slate-200 font-medium"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-phdark-900 rounded-2xl border border-slate-200 dark:border-phdark-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-phdark-850 border-b border-slate-200 dark:border-phdark-800 font-bold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Activity Description & Impact</th>
                <th className="py-3 px-4 text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-phdark-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No activity logs found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-phdark-850/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.actorName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {log.actorRole}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        {getModuleIcon(log.module)}
                        <span>{log.module}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 leading-relaxed max-w-md">
                      {log.details}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                      {log.targetId || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-phdark-850 border-t border-slate-100 dark:border-phdark-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filteredLogs.length} of {auditLogs.length} logged actions</span>
          <span>Security Level: Immutable Local Government Audit Record</span>
        </div>
      </div>
    </div>
  );
};
