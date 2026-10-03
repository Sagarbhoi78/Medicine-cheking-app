import React from 'react';
import { useApp } from '../context/AppContext';
import { Check, X, ArrowRight, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ComparisonScreen: React.FC = () => {
  const {
    lastVerificationResult,
    selectedPrescriptionMedicine,
    navigateToDeepScreen,
    navigateBackFromDeepScreen,
    rescanCurrentMedicine,
  } = useApp();

  if (!lastVerificationResult || !selectedPrescriptionMedicine) {
    return (
      <div className="flex-1 p-6 text-center text-slate-500 text-xs">
        No verification comparison data available.{' '}
        <button onClick={navigateBackFromDeepScreen} className="underline text-slate-900">
          Go Back
        </button>
      </div>
    );
  }

  const { status, expected, scanned, matchResult, scannedBarcode, found } = lastVerificationResult;
  const isMatch = status === 'VERIFIED';

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Top Banner */}
      <div
        className={`p-3 rounded-xs border flex items-center justify-between ${
          isMatch
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-red-50 border-red-300 text-red-950'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isMatch ? (
            <div className="w-6 h-6 rounded-xs bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Check className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-xs bg-red-600 text-white flex items-center justify-center font-bold">
              <X className="w-4 h-4" />
            </div>
          )}
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider">
              {isMatch ? 'MEDICINE VERIFIED' : 'MEDICINE MISMATCH'}
            </h1>
            <p className="text-[11px] opacity-80">
              {isMatch
                ? 'Field-by-field verification completed successfully.'
                : 'Scanned medicine does not match prescription requirements.'}
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs ${
            isMatch ? 'bg-emerald-200/60 text-emerald-900' : 'bg-red-200/60 text-red-900'
          }`}
        >
          {isMatch ? 'PASS' : 'FAIL'}
        </span>
      </div>

      {/* Field-by-Field Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Field-by-Field Verification Engine
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            GTIN: {scannedBarcode}
          </span>
        </div>

        <div className="p-3.5 space-y-3 text-xs">
          {/* COMPARISON ROW 1: MEDICINE NAME */}
          <div className="border border-slate-200 rounded-xs p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                1. Medicine Name
              </span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-xs flex items-center space-x-1 ${
                  matchResult.name
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {matchResult.name ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>{matchResult.name ? 'Match' : 'Mismatch'}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">Expected:</span>
                <span className="font-semibold text-slate-900">{expected.medicineName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Scanned:</span>
                <span
                  className={`font-semibold ${
                    matchResult.name ? 'text-slate-900' : 'text-red-700 underline'
                  }`}
                >
                  {scanned?.medicineName || 'Item Not Found in Formulary'}
                </span>
              </div>
            </div>
          </div>

          {/* COMPARISON ROW 2: STRENGTH */}
          <div className="border border-slate-200 rounded-xs p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                2. Strength
              </span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-xs flex items-center space-x-1 ${
                  matchResult.strength
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {matchResult.strength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>{matchResult.strength ? 'Match' : 'Mismatch'}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">Expected:</span>
                <span className="font-semibold text-slate-900">{expected.strength}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Scanned:</span>
                <span
                  className={`font-semibold font-mono ${
                    matchResult.strength ? 'text-slate-900' : 'text-red-700 bg-red-50 px-1 rounded-xs'
                  }`}
                >
                  {scanned?.strength || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* COMPARISON ROW 3: DOSAGE FORM */}
          <div className="border border-slate-200 rounded-xs p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                3. Dosage Form
              </span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-xs flex items-center space-x-1 ${
                  matchResult.dosageForm
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {matchResult.dosageForm ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>{matchResult.dosageForm ? 'Match' : 'Mismatch'}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">Expected:</span>
                <span className="font-semibold text-slate-900">{expected.dosageForm}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Scanned:</span>
                <span
                  className={`font-semibold ${
                    matchResult.dosageForm ? 'text-slate-900' : 'text-red-700 bg-red-50 px-1 rounded-xs'
                  }`}
                >
                  {scanned?.dosageForm || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Manufacturer & Pack info */}
          {scanned && (
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Manufacturer: {scanned.manufacturer}</span>
              <span className="font-mono">Exp: {scanned.expiryDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Actions */}
      {isMatch ? (
        <div className="space-y-2">
          <button
            onClick={() => navigateToDeepScreen('verified')}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            <span>Proceed to Confirmation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => navigateToDeepScreen('mismatch')}
            className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            <span>View Mismatch Safety Resolution</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={rescanCurrentMedicine}
            className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xs flex items-center justify-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Scan Again Immediately</span>
          </button>
        </div>
      )}
    </div>
  );
};
