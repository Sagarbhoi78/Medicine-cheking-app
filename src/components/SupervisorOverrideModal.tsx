import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, AlertTriangle, KeyRound, Check, X } from 'lucide-react';

interface SupervisorOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupervisorOverrideModal: React.FC<SupervisorOverrideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedPrescriptionMedicine, authorizeSupervisorOverride } = useApp();
  const [supervisorStaffId, setSupervisorStaffId] = useState('SUP-108');
  const [passwordOrPin, setPasswordOrPin] = useState('');
  const [reasonCategory, setReasonCategory] = useState('FORMULARY_SUBSTITUTION');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !selectedPrescriptionMedicine) return null;

  const REASON_PRESETS = [
    { id: 'FORMULARY_SUBSTITUTION', label: 'Formulary Pre-Approved Generic Substitution' },
    { id: 'PHYSICIAN_AMENDMENT', label: 'Physician Verbal/Signed Dose Amendment Verified' },
    { id: 'MANUFACTURER_PACK_EQUIV', label: 'Equivalent Strength Bio-Identical Batch Dispatched' },
    { id: 'EMERGENCY_DISPENSE', label: 'Urgent Stat Dose Override (Clinical Order on File)' },
    { id: 'CUSTOM', label: 'Other Clinical Reason (Specify in detail)' },
  ];

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!passwordOrPin) {
      setErrorMessage('Supervisor password or security PIN is required.');
      return;
    }

    const selectedLabel = REASON_PRESETS.find((p) => p.id === reasonCategory)?.label || '';
    const fullReason =
      reasonCategory === 'CUSTOM'
        ? customReason.trim()
        : `${selectedLabel}${customReason.trim() ? ` — ${customReason.trim()}` : ''}`;

    if (fullReason.length < 5) {
      setErrorMessage('Please provide a valid clinical justification for this override.');
      return;
    }

    setIsSubmitting(true);
    const result = await authorizeSupervisorOverride(supervisorStaffId, passwordOrPin, fullReason);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.message || 'Authorization failed. Verify supervisor credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-md w-full border border-slate-300 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-amber-700 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-200" />
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Supervisor Override Authorization
              </h3>
              <p className="text-[11px] text-amber-200">
                Controlled override required for dispensing mismatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white p-1 rounded-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-start space-x-2.5 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Audit Notice: </span>
            This action bypasses deterministic automated verification. It will be permanently recorded
            in the pharmacy compliance audit log with your supervisor credentials.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAuthorize} className="p-4 space-y-3.5 text-xs text-slate-800">
          {/* Target Medicine Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Item Requiring Override
            </div>
            <div className="font-semibold text-slate-900 text-sm mt-0.5">
              {selectedPrescriptionMedicine.medicineName} {selectedPrescriptionMedicine.strength}
            </div>
            <div className="text-slate-600 text-xs">
              Dosage Form: {selectedPrescriptionMedicine.dosageForm} · Qty: {selectedPrescriptionMedicine.quantity}
            </div>
          </div>

          {/* Supervisor ID */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Supervisor Staff ID / Email
            </label>
            <input
              type="text"
              value={supervisorStaffId}
              onChange={(e) => setSupervisorStaffId(e.target.value)}
              placeholder="e.g. SUP-108"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-700 font-mono"
              required
            />
            <span className="text-[10px] text-slate-500">
              Demo supervisor: <strong className="font-mono">SUP-108</strong> (Dr. Marcus Vance)
            </span>
          </div>

          {/* Password / PIN */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Supervisor Password or Security PIN</span>
              <KeyRound className="w-3 h-3 text-slate-400" />
            </label>
            <input
              type="password"
              value={passwordOrPin}
              onChange={(e) => setPasswordOrPin(e.target.value)}
              placeholder="Enter PIN (e.g. 8899) or Password"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-700 font-mono tracking-widest"
              required
            />
            <span className="text-[10px] text-slate-500">
              Demo PIN: <strong className="font-mono">8899</strong> or pass:{' '}
              <strong className="font-mono">supervisor123</strong>
            </span>
          </div>

          {/* Clinical Justification Category */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Clinical Override Justification
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-700"
            >
              {REASON_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Clinical Notes / Authorization Remarks
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={2}
              placeholder="Enter doctor confirmation or formulary substitution notes..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-700 resize-none"
            />
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-xs text-[11px]">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-xs border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Authenticating...' : 'Authorize Override'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
