import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, ShieldCheck, Printer, ArrowRight, Home, FileText } from 'lucide-react';

export const VerificationCompleteScreen: React.FC = () => {
  const { activePrescription, currentUser, setPharmacistTab, navigateBackFromDeepScreen } = useApp();

  if (!activePrescription) {
    return (
      <div className="flex-1 p-6 text-center text-slate-500 text-xs">
        No active prescription.{' '}
        <button onClick={() => setPharmacistTab('home')} className="underline">
          Go Home
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Success Banner */}
      <div className="bg-emerald-800 text-white rounded-sm p-4 text-center space-y-2 shadow-2xs">
        <div className="w-12 h-12 bg-emerald-700 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-sm font-bold uppercase tracking-wider">
          DISPENSING VERIFICATION COMPLETE
        </h1>
        <p className="text-xs text-emerald-100">
          All required medications in Prescription #{activePrescription.prescriptionNumber} have been
          verified and approved for patient dispensing.
        </p>
      </div>

      {/* Prescription Dispense Manifest */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Order Details</span>
            <div className="font-bold text-slate-900">
              Prescription #{activePrescription.prescriptionNumber}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient Ref</span>
            <div className="font-semibold text-slate-800">{activePrescription.patientRef}</div>
          </div>
        </div>

        {/* Verified Medicines List */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Verified Dispensing Manifest ({activePrescription.medicines.length} Items)
          </div>

          {activePrescription.medicines.map((med, i) => (
            <div
              key={med.id}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-slate-900">
                  {i + 1}. {med.medicineName} {med.strength}
                </div>
                <div className="text-[11px] text-slate-500">
                  {med.dosageForm} · Qty: {med.quantity} · {med.frequency}
                </div>
                {med.scannedBarcode && (
                  <div className="text-[10px] font-mono text-slate-400">
                    GTIN: {med.scannedBarcode}
                  </div>
                )}
                {med.overrideReason && (
                  <div className="text-[10px] font-medium text-amber-700">
                    Override: {med.overrideReason}
                  </div>
                )}
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase ${
                  med.confirmationStatus === 'OVERRIDDEN'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {med.confirmationStatus}
              </span>
            </div>
          ))}
        </div>

        {/* Pharmacist Signoff Footer */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Verified By:</span>
            <span className="font-semibold text-slate-900">
              {currentUser?.name} ({currentUser?.staffId})
            </span>
          </div>
          <div className="flex justify-between">
            <span>Hospital Department:</span>
            <span>{currentUser?.department || 'Central Inpatient Pharmacy'}</span>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-slate-400">
            <span>Verification Timestamp:</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handlePrint}
          className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xs flex items-center justify-center space-x-1.5 shadow-2xs"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print Dispensing Verification Label</span>
        </button>

        <button
          onClick={() => setPharmacistTab('home')}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center space-x-1.5 shadow-2xs"
        >
          <Home className="w-4 h-4" />
          <span>Return to Pharmacy Dashboard</span>
        </button>
      </div>
    </div>
  );
};
