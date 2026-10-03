import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, CheckCircle2, AlertTriangle, Search, Filter, ShieldCheck, ArrowLeft } from 'lucide-react';

export const VerificationHistoryScreen: React.FC = () => {
  const { verificationHistory, currentUser, setAdminTab } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = verificationHistory.filter((item) => {
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesQuery =
      item.expectedMedicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prescriptionNumber.includes(searchQuery) ||
      item.scannedBarcode.includes(searchQuery) ||
      item.staffName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Verification History
          </h1>
          <p className="text-[11px] text-slate-500">
            Immutable audit log of all clinical barcode verification scans
          </p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setAdminTab('audit')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 bg-white px-2 py-1 rounded-xs"
          >
            System Audit Trail
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine, Rx #, barcode, or staff ID..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xs text-xs bg-slate-50 text-slate-900"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex space-x-1.5 text-xs">
          {['ALL', 'VERIFIED', 'MISMATCH', 'OVERRIDDEN'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2 py-0.8 rounded-xs font-semibold text-[10px] uppercase transition-colors ${
                filterStatus === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Records Count */}
      <div className="text-[11px] font-semibold text-slate-500 flex justify-between">
        <span>Showing {filteredHistory.length} verification events</span>
        <span className="font-mono text-[10px]">Hospital Security Compliant</span>
      </div>

      {/* Verification Logs List */}
      <div className="space-y-2.5">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xs p-3 shadow-2xs space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Rx #{item.prescriptionNumber} · {new Date(item.timestamp).toLocaleString()}
                </span>
                <div className="text-xs font-bold text-slate-900">
                  {item.expectedMedicineName} {item.expectedStrength} ({item.expectedDosageForm})
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase ${
                  item.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.status === 'OVERRIDDEN'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {item.status === 'VERIFIED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                {item.status === 'MISMATCH' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                <span>{item.status}</span>
              </span>
            </div>

            {/* Comparison values */}
            <div className="bg-slate-50 border border-slate-200 rounded-xs p-2 text-[11px] grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Expected Prescription:</span>
                <span className="font-semibold text-slate-800">
                  {item.expectedMedicineName} {item.expectedStrength}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Physical Scanned Item:</span>
                <span
                  className={`font-semibold ${
                    item.status === 'VERIFIED' ? 'text-slate-800' : 'text-red-700'
                  }`}
                >
                  {item.scannedMedicineName} {item.scannedStrength} ({item.scannedDosageForm})
                </span>
              </div>
            </div>

            {/* Override note if applicable */}
            {item.overrideDetails && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded-xs text-[10px]">
                <div className="font-bold">Authorized Clinical Override</div>
                <div>Authorized By: {item.overrideDetails.supervisorName} ({item.overrideDetails.supervisorStaffId})</div>
                <div>Clinical Reason: {item.overrideDetails.reason}</div>
              </div>
            )}

            {/* Footer / Staff */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
              <span className="font-mono">GTIN: {item.scannedBarcode}</span>
              <span>Operator: {item.staffName}</span>
            </div>
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-sm p-6 text-center text-xs text-slate-500">
            No verification events match the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
};
