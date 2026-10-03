import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Database, ChevronRight, Barcode, Shield } from 'lucide-react';
import { Medicine } from '../types';

export const MedicineDatabaseScreen: React.FC = () => {
  const { formulary, setSelectedMedicineForDetail, navigateToDeepScreen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMedicines = formulary.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.medicineName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.brandName.toLowerCase().includes(q) ||
      m.barcode.includes(q) ||
      m.manufacturer.toLowerCase().includes(q) ||
      m.strength.toLowerCase().includes(q)
    );
  });

  const handleSelectMedicine = (med: Medicine) => {
    setSelectedMedicineForDetail(med);
    navigateToDeepScreen('medicine-detail');
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Hospital Formulary Database
          </h1>
          <p className="text-[11px] text-slate-500">
            Formulary medicines, GTIN barcodes, and packaging specifications
          </p>
        </div>
        <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded-xs font-semibold">
          {formulary.length} Formulary Items
        </span>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by generic, brand, GTIN barcode, or strength..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xs text-xs bg-slate-50 text-slate-900 font-medium"
          />
        </div>
      </div>

      {/* Medicines Table / Cards List */}
      <div className="space-y-2">
        {filteredMedicines.map((med) => (
          <div
            key={med.id}
            onClick={() => handleSelectMedicine(med)}
            className="bg-white border border-slate-200 rounded-xs p-3 shadow-2xs hover:border-slate-400 cursor-pointer transition-colors flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-slate-900">
                  {med.medicineName}
                </span>
                <span className="font-bold text-xs text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded-xs font-mono">
                  {med.strength}
                </span>
                <span className="text-[10px] text-slate-500">
                  {med.dosageForm}
                </span>
              </div>

              <div className="text-[11px] text-slate-500">
                Generic: {med.genericName} · {med.brandName}
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center space-x-1">
                  <Barcode className="w-3 h-3 text-slate-400" />
                  <span>GTIN: {med.barcode}</span>
                </span>
                <span>·</span>
                <span>{med.manufacturer}</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          </div>
        ))}

        {filteredMedicines.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-sm p-6 text-center text-xs text-slate-500">
            No formulary records match your search.
          </div>
        )}
      </div>
    </div>
  );
};
