import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, AlertTriangle, ArrowLeft } from 'lucide-react';

export const EditMedicineScreen: React.FC = () => {
  const {
    editingMedicine,
    activePrescription,
    updatePrescriptionMedicine,
    navigateBackFromDeepScreen,
    currentUser,
    addAuditRecord,
  } = useApp();

  if (!editingMedicine || !activePrescription) {
    return (
      <div className="flex-1 p-6 text-center text-slate-500 text-xs">
        No medicine selected for editing.{' '}
        <button onClick={navigateBackFromDeepScreen} className="underline text-slate-900">
          Return to Review
        </button>
      </div>
    );
  }

  const [medicineName, setMedicineName] = useState(editingMedicine.medicineName);
  const [strength, setStrength] = useState(editingMedicine.strength);
  const [dosageForm, setDosageForm] = useState(editingMedicine.dosageForm);
  const [dose, setDose] = useState(editingMedicine.dose || '1 unit');
  const [frequency, setFrequency] = useState(editingMedicine.frequency || 'TID');
  const [route, setRoute] = useState(editingMedicine.route || 'Oral');
  const [duration, setDuration] = useState(editingMedicine.duration || '3 days');
  const [quantity, setQuantity] = useState(editingMedicine.quantity || 1);
  const [correctionNote, setCorrectionNote] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const originalText = `${editingMedicine.medicineName} ${editingMedicine.strength}`;
    const newText = `${medicineName.trim()} ${strength.trim()}`;
    const wasModified = originalText !== newText;

    updatePrescriptionMedicine(activePrescription.id, editingMedicine.id, {
      medicineName: medicineName.trim(),
      strength: strength.trim(),
      dosageForm: dosageForm.trim(),
      dose: dose.trim(),
      frequency: frequency.trim(),
      route: route.trim(),
      duration: duration.trim(),
      quantity: Number(quantity),
      originalOcrName: editingMedicine.originalOcrName || editingMedicine.medicineName,
      originalOcrStrength: editingMedicine.originalOcrStrength || editingMedicine.strength,
      manualCorrectionNote: wasModified ? `Edited from "${originalText}" to "${newText}"` : undefined,
      correctedBy: currentUser?.staffId,
      correctedAt: new Date().toISOString(),
    });

    if (wasModified) {
      addAuditRecord(
        'PRESCRIPTION_EDITED',
        'PRESCRIPTION',
        editingMedicine.id,
        `Pharmacist corrected OCR: "${originalText}" -> "${newText}". Note: ${correctionNote || 'Manual clarification'}.`
      );
    }

    navigateBackFromDeepScreen();
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Edit Prescription Medicine
        </h1>
        <p className="text-[11px] text-slate-500">
          Manual correction of extracted prescription data (Audited)
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3.5 text-xs text-slate-800">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Medicine Name (Generic or Brand)
          </label>
          <input
            type="text"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs font-semibold text-slate-900 bg-slate-50"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Strength</label>
            <input
              type="text"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              placeholder="e.g. 500 mg"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs font-mono bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dosage Form</label>
            <select
              value={dosageForm}
              onChange={(e) => setDosageForm(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs bg-slate-50"
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Ointment">Ointment</option>
              <option value="Drops">Drops</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dose</label>
            <input
              type="text"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="e.g. 1 tablet"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
            <input
              type="text"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g. TID, BD, OD"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs bg-slate-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Route</label>
            <input
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="Oral"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="3 days"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs font-mono bg-slate-50"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Pharmacist Correction Reason (Audit Trail)</label>
          <input
            type="text"
            value={correctionNote}
            onChange={(e) => setCorrectionNote(e.target.value)}
            placeholder="e.g. Corrected OCR transcription typo 50O mg -> 500 mg"
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs bg-slate-50 text-slate-800"
          />
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
          <button
            type="button"
            onClick={navigateBackFromDeepScreen}
            className="px-3 py-1.5 border border-slate-300 rounded-xs text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xs flex items-center space-x-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Record Audit</span>
          </button>
        </div>
      </form>
    </div>
  );
};
