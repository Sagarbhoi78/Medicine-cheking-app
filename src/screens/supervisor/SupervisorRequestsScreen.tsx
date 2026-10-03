import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Check, X, AlertTriangle, FileText } from 'lucide-react';

export const SupervisorRequestsScreen: React.FC = () => {
  const { overrideRequests, approveOverrideRequest, rejectOverrideRequest } = useApp();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);

  const selectedRequest = overrideRequests.find((r) => r.id === selectedRequestId);

  const handleExecuteDecision = () => {
    if (!selectedRequestId || !decisionReason.trim() || !actionType) return;

    if (actionType === 'APPROVE') {
      approveOverrideRequest(selectedRequestId, decisionReason.trim());
    } else {
      rejectOverrideRequest(selectedRequestId, decisionReason.trim());
    }

    setSelectedRequestId(null);
    setDecisionReason('');
    setActionType(null);
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Controlled Override Requests
        </h1>
        <p className="text-[11px] text-slate-500">
          Pharmacist clinical justification reviews for safety mismatches
        </p>
      </div>

      <div className="space-y-3">
        {overrideRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-sm p-8 text-center text-xs text-slate-500 space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-semibold text-slate-700">No Override Requests</div>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              All clinical dispensing verifications have proceeded without supervisor override escalation.
            </p>
          </div>
        ) : (
          overrideRequests.map((req) => (
          <div
            key={req.id}
            className={`bg-white border rounded-sm p-4 shadow-2xs space-y-3 ${
              req.status === 'PENDING' ? 'border-amber-300' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Order #{req.prescriptionNumber} · {new Date(req.requestedAt).toLocaleTimeString()}
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {req.medicineName} ({req.expectedStrength})
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase ${
                  req.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-900'
                    : req.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {req.status}
              </span>
            </div>

            {/* Expected vs Scanned Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Expected Prescription:</span>
                <span className="font-bold text-slate-900">{req.medicineName} {req.expectedStrength}</span>
                <span className="text-slate-500 block text-[11px]">{req.expectedForm}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Physical Pack Scanned:</span>
                <span className="font-bold text-red-700">{req.scannedMedicineName} {req.scannedStrength}</span>
                <span className="text-slate-500 block text-[11px]">{req.scannedForm}</span>
              </div>
            </div>

            {/* Pharmacist Clinical Justification */}
            <div className="text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-xs border border-amber-200">
              <span className="font-semibold block text-[10px] text-amber-800 uppercase">
                Pharmacist Justification ({req.pharmacistName}):
              </span>
              <p className="mt-0.5 text-[11px] text-slate-700">{req.pharmacistNote}</p>
            </div>

            {/* Supervisor Decision Record if completed */}
            {req.status !== 'PENDING' && req.supervisorDecisionReason && (
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                <span className="font-semibold block text-[10px] text-slate-500 uppercase">
                  Supervisor Decision ({req.reviewedByName}):
                </span>
                <p className="mt-0.5 text-[11px] font-medium">{req.supervisorDecisionReason}</p>
              </div>
            )}

            {/* Action Buttons for Pending Requests */}
            {req.status === 'PENDING' && (
              <div className="pt-2 flex space-x-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedRequestId(req.id);
                    setActionType('APPROVE');
                    setDecisionReason('Approved pre-authorized formulary brand equivalent.');
                  }}
                  className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xs flex items-center justify-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Override</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedRequestId(req.id);
                    setActionType('REJECT');
                    setDecisionReason('Rejected. Retrieve exact prescribed brand or request physician signed amendment.');
                  }}
                  className="flex-1 py-1.5 bg-white border border-red-300 hover:bg-red-50 text-red-700 font-semibold text-xs rounded-xs flex items-center justify-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject Override</span>
                </button>
              </div>
            )}
          </div>
        )))}
      </div>

      {/* Decision Dialog Modal */}
      {selectedRequestId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-sm w-full p-4 border border-slate-300 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase">
              {actionType === 'APPROVE' ? 'Authorize Clinical Override' : 'Reject Override Request'}
            </h3>
            <p className="text-slate-600">
              Provide clinical justification. This event will be recorded in the hospital safety audit ledger.
            </p>
            <textarea
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              rows={3}
              placeholder="Clinical reason..."
              className="w-full p-2 border border-slate-300 rounded-xs bg-slate-50 text-slate-900"
            />
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedRequestId(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDecision}
                disabled={!decisionReason.trim()}
                className={`px-4 py-1.5 rounded-xs font-semibold text-white ${
                  actionType === 'APPROVE' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
