import React from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, Shield, CheckCircle2 } from 'lucide-react';

export const VerifyMedicineScreen: React.FC = () => {
  const {
    selectedPrescriptionMedicine,
    activePrescription,
    navigateToDeepScreen,
    navigateBackFromDeepScreen,
  } = useApp();

  if (!selectedPrescriptionMedicine || !activePrescription) {
    return (
      <div className="flex-1 p-6 text-center text-slate-500 text-xs">
        No medicine selected for verification.{' '}
        <button onClick={navigateBackFromDeepScreen} className="underline text-slate-900">
          Return to Prescription
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Verify Medication
        </h1>
        <p className="text-[11px] text-slate-500">
          Step 1 of 2: Review expected prescription parameters
        </p>
      </div>

      {/* Expected Medicine Card */}
      <div className="bg-white border-2 border-slate-300 rounded-sm p-4 shadow-2xs space-y-3">
        <div className="flex items-start justify-between pb-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Expected Prescription Item
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {selectedPrescriptionMedicine.medicineName}
            </h2>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-xs font-mono font-semibold">
            Rx #{activePrescription.prescriptionNumber}
          </span>
        </div>

        {/* Expected Parameters */}
        <div className="bg-slate-50 border border-slate-200 rounded-xs p-3 space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Strength:</span>
            <span className="font-bold text-slate-900 text-sm">
              {selectedPrescriptionMedicine.strength}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Dosage Form:</span>
            <span className="font-bold text-slate-900">
              {selectedPrescriptionMedicine.dosageForm}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Quantity to Dispense:</span>
            <span className="font-bold text-slate-900 font-mono">
              {selectedPrescriptionMedicine.quantity} units
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Prescribed Dose:</span>
            <span className="text-slate-800">{selectedPrescriptionMedicine.dose}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 font-medium">Frequency / Route:</span>
            <span className="text-slate-800">
              {selectedPrescriptionMedicine.frequency} ({selectedPrescriptionMedicine.route})
            </span>
          </div>
        </div>

        {/* Safety Rule Notice */}
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xs text-[11px] text-blue-900 flex items-start space-x-2">
          <Shield className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            The physical pack barcode must match all 3 criteria:
            <span className="font-semibold"> Medicine Name</span>,
            <span className="font-semibold"> Strength</span>, and
            <span className="font-semibold"> Dosage Form</span>.
          </div>
        </div>
      </div>

      {/* Action to scan */}
      <div className="pt-2">
        <button
          onClick={() => navigateToDeepScreen('barcode-scanner')}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center space-x-2 transition-colors shadow-2xs"
        >
          <QrCode className="w-4 h-4" />
          <span>Open Barcode / QR Scanner</span>
        </button>
        <p className="text-[10px] text-slate-500 text-center mt-2">
          Point device camera at the 2D DataMatrix or 1D Barcode on the medicine package.
        </p>
      </div>
    </div>
  );
};
