import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  QrCode,
  ChevronRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    currentUser,
    activePrescription,
    verificationHistory,
    navigateToDeepScreen,
    setPharmacistTab,
    startVerifyingMedicine,
  } = useApp();

  const verifiedCount = activePrescription
    ? activePrescription.medicines.filter(
        (m) => m.confirmationStatus === 'VERIFIED' || m.confirmationStatus === 'OVERRIDDEN'
      ).length
    : 0;

  const pendingCount = activePrescription
    ? activePrescription.medicines.filter((m) => m.confirmationStatus === 'PENDING').length
    : 0;

  const totalCount = activePrescription ? activePrescription.medicines.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  // Handle Quick Action: Scan Medicine
  const handleScanMedicineClick = () => {
    if (activePrescription) {
      const firstPending = activePrescription.medicines.find((m) => m.confirmationStatus === 'PENDING');
      if (firstPending) {
        startVerifyingMedicine(firstPending);
        return;
      }
      if (activePrescription.medicines.length > 0) {
        startVerifyingMedicine(activePrescription.medicines[0]);
        return;
      }
    }
    setPharmacistTab('prescriptions');
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-5 overflow-y-auto space-y-5 transition-colors">
      {/* 1. GREETING & OPERATIONAL CONTEXT (Direct surface, no heavy border card) */}
      <div className="pt-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Good morning, {currentUser?.name?.split(' ')[0] || 'Sagar'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          {currentUser?.title || 'Senior Clinical Pharmacist'} · {currentUser?.department || 'Central Pharmacy'}
        </p>
      </div>

      {/* 2. ACTIVE WORK — THE STRONGEST ELEMENT ON THE SCREEN */}
      {activePrescription ? (
        <section className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-3.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                Active Work
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Prescription #{activePrescription.prescriptionNumber}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activePrescription.patientRef} · {activePrescription.prescriberName}
              </div>
            </div>

            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                activePrescription.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800'
              }`}
            >
              {activePrescription.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
            </span>
          </div>

          {/* Counts & Progress */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="font-medium">
                {totalCount} medicines ·{' '}
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  {verifiedCount} verified
                </span>{' '}
                ·{' '}
                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                  {pendingCount} pending
                </span>
              </span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                {progressPercent}%
              </span>
            </div>

            {/* Restrained Clinical Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-700 dark:bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Prominent Action Button */}
          <button
            onClick={() => {
              if (activePrescription.status === 'PENDING_REVIEW') {
                navigateToDeepScreen('review-prescription');
              } else {
                navigateToDeepScreen('prescription-detail');
              }
            }}
            className="w-full py-2.5 px-4 bg-teal-800 hover:bg-teal-900 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold text-xs sm:text-sm rounded-md flex items-center justify-center space-x-2 transition-colors shadow-2xs cursor-pointer"
          >
            <span>
              {activePrescription.status === 'COMPLETED'
                ? 'View Completed Dispensing Record'
                : 'Continue Verification'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      ) : (
        <section className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg p-5 text-center shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No active prescription order selected. Start a new order below.
          </p>
        </section>
      )}

      {/* 3. QUICK ACTIONS — CLEAN, PROMINENT, HEALTHCARE ORIENTED */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigateToDeepScreen('new-prescription')}
            className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-3.5 rounded-lg text-left shadow-2xs flex items-center space-x-3 transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/60 group-hover:text-teal-700 transition-colors">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                New Prescription
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Scan or import order
              </div>
            </div>
          </button>

          <button
            onClick={handleScanMedicineClick}
            className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-3.5 rounded-lg text-left shadow-2xs flex items-center space-x-3 transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0 group-hover:bg-teal-100 dark:group-hover:bg-teal-900 transition-colors">
              <QrCode className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Scan Medicine
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Live package camera
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* 4. RECENT ACTIVITY — COMPACT CLINICAL LIST (Not a giant card) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Recent Activity
          </h2>
          <button
            onClick={() => setPharmacistTab('history')}
            className="text-xs text-teal-800 dark:text-teal-400 hover:underline font-semibold inline-flex items-center space-x-0.5 cursor-pointer"
          >
            <span>View History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {verificationHistory.length > 0 ? (
            verificationHistory.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setPharmacistTab('history')}
                className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 shrink-0">
                    {item.status === 'VERIFIED' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {item.status === 'MISMATCH' && (
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    {item.status === 'OVERRIDDEN' && (
                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.expectedMedicineName} {item.expectedStrength}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Rx #{item.prescriptionNumber} ·{' '}
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    item.status === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : item.status === 'MISMATCH'
                      ? 'bg-red-50 text-red-800 dark:bg-red-950/70 dark:text-red-300'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                  }`}
                >
                  {item.status === 'VERIFIED'
                    ? 'Verified'
                    : item.status === 'MISMATCH'
                    ? 'Mismatch'
                    : 'Overridden'}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              No recent medication verifications recorded today.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
