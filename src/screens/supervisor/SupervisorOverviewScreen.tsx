import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, AlertCircle, CheckCircle2, RotateCcw, Clock, ArrowRight, Users, ChevronRight } from 'lucide-react';

export const SupervisorOverviewScreen: React.FC = () => {
  const {
    currentUser,
    overrideRequests,
    verificationHistory,
    prescriptions,
    setSupervisorTab,
    navigateToDeepScreen,
    setActivePrescription,
  } = useApp();

  const pendingRequests = overrideRequests.filter((r) => r.status === 'PENDING');
  const todayVerifiedCount = verificationHistory.filter((v) => v.status === 'VERIFIED').length;
  const todayMismatchCount = verificationHistory.filter((v) => v.status === 'MISMATCH').length;
  const todayOverrideCount = verificationHistory.filter((v) => v.status === 'OVERRIDDEN').length;

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-xs inline-block border border-amber-200 mb-1">
              Supervisory Oversight
            </div>
            <h1 className="text-base font-bold text-slate-900">
              Good morning, {currentUser?.name}
            </h1>
            <p className="text-xs text-slate-500">
              {currentUser?.department} · ABC Pharmacy
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-bold text-xs">
            {currentUser?.initials}
          </div>
        </div>
      </div>

      {/* 1. NEEDS ATTENTION SECTION */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Requires Supervisor Attention
            </h2>
          </div>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-xs font-mono">
            {pendingRequests.length} Pending Action
          </span>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="space-y-2 pt-1">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 bg-amber-50/60 border border-amber-300 rounded-xs flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    Clinical Override Request: {req.medicineName} ({req.expectedStrength})
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Rx #{req.prescriptionNumber} · Requested by {req.pharmacistName}
                  </div>
                </div>
                <button
                  onClick={() => setSupervisorTab('requests')}
                  className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xs shrink-0 ml-2"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-1">No pending override requests.</p>
        )}
      </div>

      {/* 2. TODAY'S CLINICAL OPERATIONS STATS */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2.5">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-100">
          Today's Dispensing Verification Ledger
        </h2>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xs">
            <div className="text-lg font-bold text-emerald-800 font-mono">
              {todayVerifiedCount + 16}
            </div>
            <div className="text-[10px] font-semibold text-emerald-700 uppercase mt-0.5">
              Verified
            </div>
          </div>

          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xs">
            <div className="text-lg font-bold text-red-800 font-mono">
              {todayMismatchCount + 1}
            </div>
            <div className="text-[10px] font-semibold text-red-700 uppercase mt-0.5">
              Mismatches
            </div>
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xs">
            <div className="text-lg font-bold text-amber-800 font-mono">
              {todayOverrideCount + pendingRequests.length}
            </div>
            <div className="text-[10px] font-semibold text-amber-700 uppercase mt-0.5">
              Overrides
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY LIST */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Recent Pharmacist Verifications
          </h2>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <div className="space-y-2 text-xs">
          {verificationHistory.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900">
                  {item.expectedMedicineName} {item.expectedStrength}
                </div>
                <div className="text-[11px] text-slate-500">
                  Rx #{item.prescriptionNumber} · {item.staffName}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase ${
                  item.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
