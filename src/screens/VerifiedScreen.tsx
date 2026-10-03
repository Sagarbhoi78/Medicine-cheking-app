import React from 'react';
import { useApp } from '../context/AppContext';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const VerifiedScreen: React.FC = () => {
  const {
    lastVerificationResult,
    selectedPrescriptionMedicine,
    activePrescription,
    navigateToDeepScreen,
    navigateBackFromDeepScreen,
    startVerifyingMedicine,
  } = useApp();

  if (!lastVerificationResult || !selectedPrescriptionMedicine || !activePrescription) {
    return (
      <div className="flex-1 p-6 text-center text-slate-500 text-xs">
        No verified item available.{' '}
        <button onClick={navigateBackFromDeepScreen} className="underline text-slate-900">
          Go Back
        </button>
      </div>
    );
  }

  const nextPending = activePrescription.medicines.find(
    (m) => m.id !== selectedPrescriptionMedicine.id && m.confirmationStatus === 'PENDING'
  );

  const allCompleted = activePrescription.medicines.every(
    (m) => m.confirmationStatus === 'VERIFIED' || m.confirmationStatus === 'OVERRIDDEN'
  );

  const handleContinue = () => {
    if (allCompleted) {
      navigateToDeepScreen('verification-complete');
    } else if (nextPending) {
      startVerifyingMedicine(nextPending);
    } else {
      navigateToDeepScreen('prescription-detail');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      <div className="my-auto max-w-sm w-full mx-auto bg-white border border-slate-200 rounded-sm p-6 shadow-2xs text-center space-y-4">
        {/* Verification Icon Badge */}
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
            Dispensing Step Approved
          </span>
          <h1 className="text-base font-bold text-slate-900 uppercase tracking-wide mt-2">
            MEDICINE VERIFIED
          </h1>
          <div className="text-sm font-semibold text-slate-800 mt-1">
            {selectedPrescriptionMedicine.medicineName}
          </div>
          <div className="text-xs text-slate-500">
            {selectedPrescriptionMedicine.strength} · {selectedPrescriptionMedicine.dosageForm}
          </div>
        </div>

        {/* Triple Field Verification Checklist */}
        <div className="bg-slate-50 border border-slate-200 rounded-xs p-3 space-y-2 text-xs text-left">
          <div className="flex items-center justify-between text-slate-700">
            <span>Medicine Name</span>
            <span className="font-bold text-emerald-700 flex items-center space-x-1 font-mono">
              <span>Match</span>
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>Strength ({selectedPrescriptionMedicine.strength})</span>
            <span className="font-bold text-emerald-700 flex items-center space-x-1 font-mono">
              <span>Match</span>
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>Dosage Form ({selectedPrescriptionMedicine.dosageForm})</span>
            <span className="font-bold text-emerald-700 flex items-center space-x-1 font-mono">
              <span>Match</span>
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>Expiration Date Valid</span>
            <span className="font-bold text-emerald-700 flex items-center space-x-1 font-mono">
              <span>Match</span>
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Scanned Pack Details */}
        {lastVerificationResult.scanned && (
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 text-left space-y-0.5">
            <div>
              <span className="font-medium text-slate-700">Formulary Pack:</span>{' '}
              {lastVerificationResult.scanned.brandName}
            </div>
            <div>
              <span className="font-medium text-slate-700">Batch:</span>{' '}
              <span className="font-mono">{lastVerificationResult.scanned.batchNumber}</span> (Exp: {lastVerificationResult.scanned.expiryDate})
            </div>
            <div className="font-mono text-[10px]">
              Barcode: {lastVerificationResult.scannedBarcode}
            </div>
          </div>
        )}
      </div>

      {/* Action to continue */}
      <div className="max-w-sm w-full mx-auto pt-4">
        <button
          onClick={handleContinue}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
        >
          <span>
            {allCompleted
              ? 'Complete Verification'
              : nextPending
              ? `Continue to Next Item (${nextPending.medicineName})`
              : 'Return to Prescription'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
