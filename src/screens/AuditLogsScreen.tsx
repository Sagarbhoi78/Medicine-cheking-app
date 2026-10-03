import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, ArrowLeft, Search, Filter } from 'lucide-react';

export const AuditLogsScreen: React.FC = () => {
  const { auditLogs, currentDeepScreen, navigateBackFromDeepScreen } = useApp();
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      log.staffName.toLowerCase().includes(q) ||
      log.staffId.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q);
    return matchesAction && matchesQuery;
  });

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center space-x-2">
        {currentDeepScreen && (
          <button
            onClick={navigateBackFromDeepScreen}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Hospital Pharmacy Audit Trail
          </h1>
          <p className="text-[11px] text-slate-500">
            Protected ledger of all security and dispensing verification transactions
          </p>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, staff name, ID, or description..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xs text-xs bg-slate-50 text-slate-900 font-medium"
          />
        </div>

        <div className="flex space-x-1 overflow-x-auto pb-1 text-[10px]">
          {['ALL', 'LOGIN', 'PRESCRIPTION_CONFIRMED', 'VERIFICATION_PASSED', 'VERIFICATION_FAILED', 'OVERRIDE_AUTHORIZED'].map(
            (act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`px-2 py-0.8 rounded-xs font-semibold uppercase shrink-0 transition-colors ${
                  filterAction === act
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {act.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white border border-slate-200 rounded-xs p-3 shadow-2xs space-y-1.5 text-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <div className="font-bold text-slate-900 mt-0.5">
                  {log.action.replace(/_/g, ' ')}
                </div>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs font-mono uppercase ${
                  log.action.includes('PASSED') || log.action === 'PRESCRIPTION_CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : log.action.includes('FAILED')
                    ? 'bg-red-100 text-red-800'
                    : log.action.includes('OVERRIDE')
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {log.entityType}
              </span>
            </div>

            <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-xs border border-slate-100">
              {log.details}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>
                Staff: {log.staffName} ({log.staffId})
              </span>
              <span>Role: {log.role}</span>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-sm p-6 text-center text-xs text-slate-500">
            No audit records match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
