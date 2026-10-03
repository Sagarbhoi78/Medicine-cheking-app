import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Prescription } from '../../types';
import { Search, Plus, Filter, ChevronRight, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';

export const PrescriptionsListScreen: React.FC = () => {
  const { prescriptions, setActivePrescription, navigateToDeepScreen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchesFilter = filterStatus === 'ALL' || rx.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      rx.prescriptionNumber.includes(q) ||
      rx.patientRef.toLowerCase().includes(q) ||
      rx.prescriberName.toLowerCase().includes(q) ||
      rx.medicines.some((m) => m.medicineName.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const handleSelectPrescription = (rx: Prescription) => {
    setActivePrescription(rx);
    if (rx.status === 'PENDING_REVIEW') {
      navigateToDeepScreen('review-prescription');
    } else {
      navigateToDeepScreen('prescription-detail');
    }
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Hospital Prescriptions
          </h1>
          <p className="text-[11px] text-slate-500">
            Inpatient ward orders and outpatient dispensing lists
          </p>
        </div>
        <button
          onClick={() => navigateToDeepScreen('new-prescription')}
          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xs text-xs font-semibold flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Order</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Rx #, patient bed, doctor, or drug name..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xs text-xs bg-slate-50 text-slate-900"
          />
        </div>

        <div className="flex space-x-1.5 text-xs">
          {['ALL', 'ACTIVE', 'PENDING_REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2 py-0.8 rounded-xs font-semibold text-[10px] uppercase transition-colors ${
                filterStatus === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-2.5">
        {filteredPrescriptions.map((rx) => {
          const verifiedCount = rx.medicines.filter(
            (m) => m.confirmationStatus === 'VERIFIED' || m.confirmationStatus === 'OVERRIDDEN'
          ).length;
          const totalCount = rx.medicines.length;

          return (
            <div
              key={rx.id}
              onClick={() => handleSelectPrescription(rx)}
              className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs hover:border-slate-400 cursor-pointer transition-colors space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Prescription #{rx.prescriptionNumber} · {rx.prescriptionDate}
                  </span>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {rx.patientRef}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Physician: {rx.prescriberName}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase ${
                    rx.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rx.status === 'PENDING_REVIEW'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  {rx.status.replace('_', ' ')}
                </span>
              </div>

              {/* Medicines Summary */}
              <div className="text-[11px] text-slate-600 font-mono flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                {rx.medicines.map((m, i) => (
                  <span
                    key={i}
                    className={`px-1.5 py-0.5 rounded-xs border text-[10px] ${
                      m.confirmationStatus === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {m.medicineName} ({m.strength})
                  </span>
                ))}
              </div>

              {/* Progress Footer */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                <span className="font-semibold text-slate-800">
                  {verifiedCount} of {totalCount} verified
                </span>
                <div className="flex items-center space-x-1 text-slate-700 font-medium">
                  <span>Open Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredPrescriptions.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-sm p-6 text-center text-xs text-slate-500 space-y-2">
            <div>No prescriptions match the selected criteria.</div>
            <button
              onClick={() => navigateToDeepScreen('new-prescription')}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xs font-semibold text-xs inline-block"
            >
              Start New Prescription
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
