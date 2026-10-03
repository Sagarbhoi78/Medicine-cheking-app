import React from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Upload, Edit3, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { SAMPLE_PRESCRIPTIONS_DATA } from '../services/mockData';

export const NewPrescriptionScreen: React.FC = () => {
  const { navigateToDeepScreen, createDraftPrescription } = useApp();

  const handleSelectPreset = (preset: typeof SAMPLE_PRESCRIPTIONS_DATA[0]) => {
    createDraftPrescription({
      prescriptionNumber: `${Math.floor(1000 + Math.random() * 9000)}`,
      patientRef: preset.patient,
      prescriberName: preset.doctor,
      sourceType: 'CAMERA_SCAN',
      medicines: preset.medicines,
    });
    navigateToDeepScreen('ocr-processing');
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          New Prescription Order
        </h1>
        <p className="text-[11px] text-slate-500">
          Capture paper ward slip or import EHR prescription document
        </p>
      </div>

      {/* Capture Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Camera Option */}
        <button
          onClick={() => navigateToDeepScreen('scan-prescription')}
          className="bg-white border-2 border-slate-200 hover:border-slate-800 p-4 rounded-sm text-left transition-all flex flex-col justify-between group shadow-2xs"
        >
          <div>
            <div className="w-10 h-10 rounded-xs bg-slate-900 text-white flex items-center justify-center mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Scan Prescription</h2>
            <p className="text-xs text-slate-500 mt-1">
              Use terminal or mobile device camera to capture physical prescription slip.
            </p>
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-800 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
            <span>Open Camera</span>
            <span>→</span>
          </div>
        </button>

        {/* Upload Option */}
        <button
          onClick={() => navigateToDeepScreen('upload-prescription')}
          className="bg-white border-2 border-slate-200 hover:border-slate-800 p-4 rounded-sm text-left transition-all flex flex-col justify-between group shadow-2xs"
        >
          <div>
            <div className="w-10 h-10 rounded-xs bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Upload Prescription</h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload prescription image or PDF document from ward station or EHR export.
            </p>
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-800 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
            <span>Select Document</span>
            <span>→</span>
          </div>
        </button>
      </div>

      {/* Hospital Test Prescriptions Presets */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
        <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
          <FileText className="w-4 h-4 text-slate-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Standard Hospital Test Prescriptions
          </h2>
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5 mb-3">
          Select a verified hospital test dataset to demonstrate OCR extraction, review, and verification:
        </p>

        <div className="space-y-2">
          {SAMPLE_PRESCRIPTIONS_DATA.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectPreset(sample)}
              className="p-3 border border-slate-200 rounded-xs hover:border-slate-400 hover:bg-slate-50/80 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{sample.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {sample.doctor} · {sample.patient}
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded-xs">
                  {sample.medicines.length} medicines
                </span>
              </div>
              <div className="mt-2 text-[10px] text-slate-600 font-mono flex flex-wrap gap-1">
                {sample.medicines.map((m, i) => (
                  <span key={i} className="bg-slate-100 px-1 py-0.2 rounded-xs border border-slate-200">
                    {m.medicineName} {m.strength}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
