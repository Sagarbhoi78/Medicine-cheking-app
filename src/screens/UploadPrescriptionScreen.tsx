import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { SAMPLE_PRESCRIPTIONS_DATA } from '../services/mockData';

export const UploadPrescriptionScreen: React.FC = () => {
  const { navigateToDeepScreen, createDraftPrescription } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('sample-standard-5');

  const handleProcess = () => {
    const preset = SAMPLE_PRESCRIPTIONS_DATA.find((p) => p.id === selectedPreset) || SAMPLE_PRESCRIPTIONS_DATA[0];

    createDraftPrescription({
      prescriptionNumber: `${Math.floor(1000 + Math.random() * 9000)}`,
      patientRef: preset.patient,
      prescriberName: preset.doctor,
      sourceType: 'FILE_UPLOAD',
      medicines: preset.medicines,
    });

    navigateToDeepScreen('ocr-processing');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Upload Prescription
        </h1>
        <p className="text-[11px] text-slate-500">
          Import hospital prescription image or document file
        </p>
      </div>

      {/* File Dropzone */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-sm p-6 text-center hover:border-slate-500 transition-colors">
        <input
          type="file"
          id="prescription-file-input"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="prescription-file-input"
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 bg-slate-100 rounded-xs flex items-center justify-center text-slate-600 mb-2">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-800">
            {selectedFile ? selectedFile.name : 'Choose Prescription File'}
          </span>
          <span className="text-[11px] text-slate-500 mt-1">
            Accepts PNG, JPG, or PDF (Ward EHR order slip)
          </span>
        </label>
      </div>

      {/* Select Hospital Prescription Template */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Standard Clinical Prescription Presets
        </h2>
        <div className="space-y-2">
          {SAMPLE_PRESCRIPTIONS_DATA.map((p) => (
            <label
              key={p.id}
              className={`p-2.5 border rounded-xs flex items-start space-x-2.5 cursor-pointer transition-colors ${
                selectedPreset === p.id
                  ? 'border-slate-800 bg-slate-50'
                  : 'border-slate-200 hover:bg-slate-50/50'
              }`}
            >
              <input
                type="radio"
                name="preset"
                value={p.id}
                checked={selectedPreset === p.id}
                onChange={() => setSelectedPreset(p.id)}
                className="mt-0.5 text-slate-900"
              />
              <div className="text-xs flex-1">
                <div className="font-semibold text-slate-900">{p.title}</div>
                <div className="text-[11px] text-slate-500">
                  {p.doctor} · {p.patient}
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  {p.medicines.map((m) => `${m.medicineName} ${m.strength}`).join(', ')}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div>
        <button
          onClick={handleProcess}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xs flex items-center justify-center space-x-1.5 transition-colors"
        >
          <span>Extract Prescription Data</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
