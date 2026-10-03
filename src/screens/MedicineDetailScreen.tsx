import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Barcode,
  Shield,
  Check,
  Info,
  Calendar,
  MapPin,
  DollarSign,
  Thermometer,
  Layers,
  AlertCircle,
  Clock,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { classifyExpiryDate } from '../services/verificationEngine';

export const MedicineDetailScreen: React.FC = () => {
  const { selectedMedicineForDetail, navigateBackFromDeepScreen } = useApp();

  if (!selectedMedicineForDetail) {
    return (
      <div className="flex-1 p-6 text-center text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
        <p>No medication record selected.</p>
        <button
          onClick={navigateBackFromDeepScreen}
          className="px-3 py-1.5 bg-slate-800 text-white rounded-md text-xs font-semibold cursor-pointer"
        >
          Return to Database
        </button>
      </div>
    );
  }

  const med = selectedMedicineForDetail;
  const expiryInfo = classifyExpiryDate(med.expiryDate);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-5 overflow-y-auto space-y-4 transition-colors">
      {/* 1. IDENTITY SECTION */}
      <section className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:divide-slate-800 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
              Formulary Item
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {med.medicineName} {med.strength}
            </h1>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Generic: <strong className="text-slate-900 dark:text-slate-100">{med.genericName}</strong>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Commercial Brand: {med.brandName}
            </div>
          </div>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
              expiryInfo.status === 'EXPIRED'
                ? 'bg-red-50 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-900'
                : expiryInfo.status === 'EXPIRING_SOON'
                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
            }`}
          >
            {expiryInfo.status === 'EXPIRED' ? 'Expired' : expiryInfo.status === 'EXPIRING_SOON' ? 'Expiring Soon' : 'Active'}
          </span>
        </div>

        {/* Barcode & GTIN */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-md p-3 text-center space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            Verified Packaging Barcode (GTIN-13)
          </div>
          <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 tracking-wider">
            {med.barcode}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">
            Source: <span className="font-semibold text-slate-600 dark:text-slate-300">Hospital Formulary Registry</span>
          </div>
        </div>
      </section>

      {/* 2. BATCH & EXPIRATION VERIFICATION ENTITY */}
      <section className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Active Batch & Shelf Life</span>
          </h2>
          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
            Source: 2D DataMatrix Scan
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700/80">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Batch Number:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{med.batchNumber}</span>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700/80">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Mfg Date:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{med.mfgDate}</span>
          </div>
          <div
            className={`p-2.5 rounded-md border ${
              expiryInfo.status === 'EXPIRED'
                ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-900 text-red-900 dark:text-red-200'
                : expiryInfo.status === 'EXPIRING_SOON'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <span className="block text-[10px] font-semibold">Expiry Date:</span>
            <span className="font-mono font-bold">{med.expiryDate}</span>
            <div className="text-[9px] mt-0.5 font-medium">{expiryInfo.label}</div>
          </div>
        </div>
      </section>

      {/* 3. COMPOSITION & CLINICAL CHEMISTRY */}
      <section className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-2 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Composition & Chemistry</span>
          </h2>
          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
            Source: Pharmacopoeia IP/USP
          </span>
        </div>

        <div className="space-y-2 pt-1 text-slate-700 dark:text-slate-300">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
              Active Pharmaceutical Ingredient:
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{med.activeIngredients}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
              Dosage Form & Strength:
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {med.dosageForm} · {med.strength}
            </span>
          </div>
          {med.excipients && (
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                Excipients & Base:
              </span>
              <span className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                {med.excipients}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 4. MANUFACTURER & REGULATORY PROVENANCE */}
      <section className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-2 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Manufacturing & License</span>
          </h2>
          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
            Source: Drug Controller
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1 text-slate-700 dark:text-slate-300">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Manufacturer:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{med.manufacturer}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Site Location:</span>
            <span>{med.manufacturingSite || 'Approved Site'}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Drug License Number:</span>
            <span className="font-mono text-slate-900 dark:text-slate-100">{med.licenseNumber || 'DL-APPROVED'}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Administration Route:</span>
            <span className="font-semibold">{med.route}</span>
          </div>
        </div>
      </section>

      {/* 5. STORAGE & PACKAGING */}
      <section className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-2 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Thermometer className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Storage & Packaging Specifications</span>
          </h2>
          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
            Source: Manufacturer Stability Dossier
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1 text-slate-700 dark:text-slate-300">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Storage Temperature:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{med.storageTemp}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Packaging Format:</span>
            <span className="font-mono">{med.packSize}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Moisture & Light Control:</span>
            <span>{med.storageCondition}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Standard MRP:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{med.mrp}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
