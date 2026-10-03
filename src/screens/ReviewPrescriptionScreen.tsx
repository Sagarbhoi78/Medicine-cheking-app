import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PrescriptionMedicine } from '../types';
import { AlertCircle, Edit2, CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

export const ReviewPrescriptionScreen: React.FC = () => {
  const {
    activePrescription,
    navigateToDeepScreen,
    navigateBackFromDeepScreen,
    setEditingMedicine,
    confirmPrescription,
  } = useApp();

  const [hasReviewedAll, setHasReviewedAll] = useState(false);

  if (!activePrescription) {
    return (
      <div className="flex-1 p-6 text-center text-slate-500 text-xs">
        No prescription loaded for review.{' '}
        <button onClick={navigateBackFromDeepScreen} className="underline text-slate-800">
          Go Back
        </button>
      </div>
    );
  }

  const handleEdit = (med: PrescriptionMedicine) => {
    setEditingMedicine(med);
    navigateToDeepScreen('edit-medicine');
  };

  const handleConfirm = () => {
    confirmPrescription(activePrescription.id);
    navigateToDeepScreen('prescription-detail');
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Review Prescription
          </h1>
          <p className="text-[11px] text-slate-500">
            Prescription #{activePrescription.prescriptionNumber} · {activePrescription.patientRef}
          </p>
        </div>

        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-2 py-0.5 rounded-xs uppercase">
          Unconfirmed OCR
        </span>
      </div>

      {/* Instruction Safety Box */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xs flex items-start space-x-2 text-amber-900 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Pharmacist Review Mandate: </span>
          Check the extracted information before confirming. All data extracted by OCR is unconfirmed.
          Tap <strong>Edit</strong> on any item to correct discrepancies. Only confirmed prescriptions
          become active verification lists.
        </div>
      </div>

      {/* Captured Document Preview if available */}
      {activePrescription.originalImageUrl && (
        <div className="bg-white border border-slate-200 rounded-xs p-3 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Captured Physical Prescription Document</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-xs font-mono font-normal">
              Camera Snapshot
            </span>
          </div>
          <div className="max-h-36 overflow-hidden rounded-xs border border-slate-200 bg-black flex items-center justify-center">
            <img
              src={activePrescription.originalImageUrl}
              alt="Captured Prescription Source"
              className="max-h-36 w-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Medication Lines List */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Extracted Medication Items ({activePrescription.medicines.length})
        </div>

        {activePrescription.medicines.map((med, index) => (
          <div
            key={med.id}
            className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Item #{index + 1}</span>
                <div className="text-sm font-bold text-slate-900">
                  {med.medicineName}
                </div>
                {med.manualCorrectionNote && (
                  <div className="text-[10px] text-blue-700 font-medium mt-0.5">
                    Corrected: {med.manualCorrectionNote}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleEdit(med)}
                className="text-xs text-slate-700 hover:text-slate-900 font-semibold border border-slate-300 px-2.5 py-1 rounded-xs flex items-center space-x-1 hover:bg-slate-50"
              >
                <Edit2 className="w-3 h-3 text-slate-500" />
                <span>Edit</span>
              </button>
            </div>

            {/* Extracted Fields Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Strength:</span>
                <span className="font-semibold text-slate-800">{med.strength}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Dosage Form:</span>
                <span className="font-semibold text-slate-800">{med.dosageForm}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Dose:</span>
                <span className="text-slate-800">{med.dose || '1 unit'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Frequency:</span>
                <span className="text-slate-800">{med.frequency || 'Once daily'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Route:</span>
                <span className="text-slate-800">{med.route || 'Oral'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Duration:</span>
                <span className="text-slate-800">{med.duration || '3 days'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Quantity:</span>
                <span className="font-semibold text-slate-800">{med.quantity}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Status:</span>
                <span className="text-amber-700 font-mono font-medium">Unconfirmed</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Checkbox */}
      <div className="bg-white border border-slate-200 p-3 rounded-xs">
        <label className="flex items-start space-x-2.5 cursor-pointer text-xs text-slate-800">
          <input
            type="checkbox"
            checked={hasReviewedAll}
            onChange={(e) => setHasReviewedAll(e.target.checked)}
            className="mt-0.5 text-emerald-600 rounded-xs"
          />
          <div>
            <span className="font-semibold text-slate-900">
              I have manually reviewed each extracted medicine line
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              I certify that names, strengths, forms, and quantities match the written prescription order.
            </p>
          </div>
        </label>
      </div>

      {/* Confirm Button */}
      <div className="pt-2">
        <button
          onClick={handleConfirm}
          disabled={!hasReviewedAll}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center space-x-2 disabled:opacity-40 transition-colors shadow-2xs"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Confirm Prescription</span>
        </button>
        <p className="text-[10px] text-slate-500 text-center mt-1.5">
          Only after confirmation does this prescription become the active verification list.
        </p>
      </div>
    </div>
  );
};
