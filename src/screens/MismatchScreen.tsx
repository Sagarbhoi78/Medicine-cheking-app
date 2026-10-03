import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, RotateCcw, FileText, ShieldAlert, AlertTriangle } from 'lucide-react';
import { SupervisorOverrideModal } from '../components/SupervisorOverrideModal';

export const MismatchScreen: React.FC = () => {
  const {
    lastVerificationResult,
    selectedPrescriptionMedicine,
    navigateToDeepScreen,
    navigateBackFromDeepScreen,
    rescanCurrentMedicine,
  } = useApp();

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  if (!lastVerificationResult || !selectedPrescriptionMedicine) {
    return (
      <div className="flex-1 p-6 text-center text-slate-500 text-xs">
        No mismatch result data.{' '}
        <button onClick={navigateBackFromDeepScreen} className="underline text-slate-900">
          Go Back
        </button>
      </div>
    );
  }

  const { expected, scanned, matchResult, scannedBarcode, found } = lastVerificationResult;

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Alert Header */}
      <div className="bg-red-700 text-white rounded-xs p-4 shadow-2xs space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-xs bg-red-900 flex items-center justify-center font-bold">
            <X className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-sm font-bold uppercase tracking-wider">
            MEDICINE MISMATCH
          </h1>
        </div>
        <p className="text-xs text-red-100 pt-1">
          The scanned medicine does not match the prescription. Dispensing halted.
        </p>
      </div>

      {/* Safety Blocking Notice */}
      <div className="bg-white border-l-4 border-red-600 p-3 rounded-xs text-xs text-slate-800 shadow-2xs">
        <span className="font-bold text-red-700">Safety Protocol Enforced: </span>
        This item CANNOT be marked as verified or dispensed without a matching barcode rescan or
        authorized supervisor clinical override.
      </div>

      {/* EXPECTED vs SCANNED Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Expected Card */}
        <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider pb-1 border-b border-slate-100">
            EXPECTED PRESCRIPTION
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Medicine:</span>
            <span className="font-bold text-slate-900 text-xs">{expected.medicineName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Strength:</span>
            <span className="font-bold text-slate-900 text-xs font-mono">{expected.strength}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Dosage Form:</span>
            <span className="font-bold text-slate-900 text-xs">{expected.dosageForm}</span>
          </div>
        </div>

        {/* Scanned Card */}
        <div className="bg-white border border-red-300 rounded-sm p-3.5 shadow-2xs space-y-2">
          <div className="text-[10px] uppercase font-bold text-red-600 tracking-wider pb-1 border-b border-red-100 flex justify-between">
            <span>SCANNED PACKAGE</span>
            <span className="font-mono text-[9px] text-slate-400">{scannedBarcode}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Medicine:</span>
            <span
              className={`font-bold text-xs ${
                matchResult.name ? 'text-slate-900' : 'text-red-700 bg-red-50 px-1 rounded-xs inline-block'
              }`}
            >
              {scanned?.medicineName || 'Unknown / Not Found'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Strength:</span>
            <span
              className={`font-bold text-xs font-mono ${
                matchResult.strength ? 'text-slate-900' : 'text-red-700 bg-red-50 px-1 rounded-xs inline-block'
              }`}
            >
              {scanned?.strength || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Dosage Form:</span>
            <span
              className={`font-bold text-xs ${
                matchResult.dosageForm ? 'text-slate-900' : 'text-red-700 bg-red-50 px-1 rounded-xs inline-block'
              }`}
            >
              {scanned?.dosageForm || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Field Checklist Indicators */}
      <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs space-y-2 text-xs">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Field Status Summary
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-700">Medicine Name</span>
          <span
            className={`font-bold flex items-center space-x-1 ${
              matchResult.name ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            <span>{matchResult.name ? 'Match' : 'Mismatch'}</span>
            {matchResult.name ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-700">Strength Specification</span>
          <span
            className={`font-bold flex items-center space-x-1 ${
              matchResult.strength ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            <span>{matchResult.strength ? 'Match' : 'Mismatch'}</span>
            {matchResult.strength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-700">Dosage Form</span>
          <span
            className={`font-bold flex items-center space-x-1 ${
              matchResult.dosageForm ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            <span>{matchResult.dosageForm ? 'Match' : 'Mismatch'}</span>
            {matchResult.dosageForm ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          </span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="text-slate-700">Expiry Verification</span>
          <span
            className={`font-bold flex items-center space-x-1 ${
              matchResult.expiryValid ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            <span>{matchResult.expiryValid ? 'Valid Date' : 'Expired'}</span>
            {matchResult.expiryValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {/* Safety Actions */}
      <div className="space-y-2 pt-1">
        <button
          onClick={rescanCurrentMedicine}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center space-x-1.5 shadow-2xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Scan Again (Retrieve Correct Medication)</span>
        </button>

        <button
          onClick={() => navigateToDeepScreen('review-prescription')}
          className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xs flex items-center justify-center space-x-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Review Original Prescription Order</span>
        </button>

        <button
          onClick={() => setIsOverrideModalOpen(true)}
          className="w-full py-2 bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold text-xs rounded-xs flex items-center justify-center space-x-1.5"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span>Request Supervisor Clinical Override</span>
        </button>
      </div>

      {/* Supervisor Override Modal */}
      <SupervisorOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
      />
    </div>
  );
};
