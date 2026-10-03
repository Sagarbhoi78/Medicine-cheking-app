import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { currentUser, setPharmacistTab } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser) {
        setPharmacistTab('home');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentUser, setPharmacistTab]);

  return (
    <div className="flex-1 bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 bg-emerald-600 rounded-sm flex items-center justify-center mb-4 shadow-sm">
        <ShieldCheck className="w-9 h-9 text-white" />
      </div>

      <h1 className="text-xl font-bold tracking-wider uppercase text-slate-100 font-mono">
        SMART-MED SAFE
      </h1>
      <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
        Medication Verification
      </p>

      <div className="mt-8 flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Initializing Station Terminal...</span>
      </div>

      <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono">
        Clinical Pharmacy Dispensing Safety · Station v2.4
      </div>
    </div>
  );
};
