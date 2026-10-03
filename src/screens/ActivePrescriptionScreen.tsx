import React from 'react';
import { useApp } from '../context/AppContext';
import { PrescriptionMedicine } from '../types';
import { CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck, FileText, CheckCircle } from 'lucide-react';

export const ActivePrescriptionScreen: React.FC = () => {
  const {
    activePrescription,
    startVerifyingMedicine,
    navigateToDeepScreen,
    navigateBackFromDeepScreen,
  } = useApp();

  if (!activePrescription) {
    return (
      <div className="flex-1 p-6 text-center text-slate-500 text-xs">
        No active prescription selected.{' '}
        <button onClick={navigateBackFromDeepScreen} className="underline text-slate-900">
          Go Back
        </button>
      </div>
    );
  }

  const verifiedCount = activePrescription.medicines.filter(
    (m) => m.confirmationStatus === 'VERIFIED' || m.confirmationStatus === 'OVERRIDDEN'
  ).length;

  const pendingCount = activePrescription.medicines.filter(
    (m) => m.confirmationStatus === 'PENDING'
  ).length;

  const mismatchCount = activePrescription.medicines.filter(
    (m) => m.confirmationStatus === 'MISMATCH'
  ).length;

  const totalCount = activePrescription.medicines.length;
  const isComplete = verifiedCount === totalCount && totalCount > 0;

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Prescription
            </span>
            <h1 className="text-base font-bold text-slate-900 mt-0.5">
              Prescription #{activePrescription.prescriptionNumber}
            </h1>
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs uppercase ${
              isComplete
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {isComplete ? 'Verification Complete' : 'Dispensing In Progress'}
          </span>
        </div>

        <div className="mt-3 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Patient Identifier:</span>
            <span className="font-semibold text-slate-900">{activePrescription.patientRef}</span>
          </div>
          <div className="flex justify-between">
            <span>Prescribing Physician:</span>
            <span className="text-slate-800">{activePrescription.prescriberName}</span>
          </div>
          <div className="flex justify-between">
            <span>Verification Status:</span>
            <span className="font-mono font-semibold text-slate-900">
              {verifiedCount} of {totalCount} items verified ({pendingCount} pending)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
          <div
            className="bg-emerald-600 h-full transition-all"
            style={{ width: `${(verifiedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Completion Banner if finished */}
      {isComplete && (
        <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-900">
            <CheckCircle className="w-5 h-5 text-emerald-700" />
            <div>
              <div className="font-bold text-xs">All Medicines Verified</div>
              <div className="text-[11px] text-emerald-700">Order ready for final pharmacist packaging.</div>
            </div>
          </div>
          <button
            onClick={() => navigateToDeepScreen('verification-complete')}
            className="px-3 py-1.5 bg-emerald-800 text-white font-semibold text-xs rounded-xs"
          >
            View Report
          </button>
        </div>
      )}

      {/* Medication Verification List */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Prescription Line Items</span>
          <span className="font-mono text-slate-500 text-[10px]">
            {verifiedCount}/{totalCount} Done
          </span>
        </div>

        {activePrescription.medicines.map((med, index) => {
          const isVerified = med.confirmationStatus === 'VERIFIED';
          const isOverridden = med.confirmationStatus === 'OVERRIDDEN';
          const isMismatch = med.confirmationStatus === 'MISMATCH';
          const isPending = med.confirmationStatus === 'PENDING';

          return (
            <div
              key={med.id}
              className={`bg-white border rounded-xs p-3.5 shadow-2xs transition-all ${
                isVerified
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : isOverridden
                  ? 'border-amber-300 bg-amber-50/20'
                  : isMismatch
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-mono">#{index + 1}</span>
                    <h2 className="text-sm font-bold text-slate-900">
                      {med.medicineName}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {med.strength} · {med.dosageForm}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    {med.dose} · {med.frequency} · Qty: {med.quantity}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="text-right">
                  {isVerified && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  )}
                  {isOverridden && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-amber-100 text-amber-800">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Overridden</span>
                    </span>
                  )}
                  {isMismatch && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>Mismatch</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-xs text-[10px] font-medium bg-slate-100 text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {isVerified && med.scannedBarcode
                    ? `GTIN: ${med.scannedBarcode}`
                    : isOverridden
                    ? `Reason: ${med.overrideReason || 'Supervisor Authorized'}`
                    : 'Requires Barcode Scan'}
                </span>

                {isPending && (
                  <button
                    onClick={() => startVerifyingMedicine(med)}
                    className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xs flex items-center space-x-1 transition-colors"
                  >
                    <span>Verify Item</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {isMismatch && (
                  <button
                    onClick={() => startVerifyingMedicine(med)}
                    className="py-1 px-3 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs rounded-xs flex items-center space-x-1"
                  >
                    <span>Recheck / Scan Again</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {(isVerified || isOverridden) && (
                  <button
                    onClick={() => startVerifyingMedicine(med)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
                  >
                    Review Match
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
