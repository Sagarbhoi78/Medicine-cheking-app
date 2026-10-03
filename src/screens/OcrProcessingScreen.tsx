import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Loader2 } from 'lucide-react';

export const OcrProcessingScreen: React.FC = () => {
  const { navigateToDeepScreen } = useApp();
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(60), 600);
    const timer2 = setTimeout(() => setProgress(90), 1200);
    const timer3 = setTimeout(() => {
      setProgress(100);
      navigateToDeepScreen('review-prescription');
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigateToDeepScreen]);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-xs w-full bg-white border border-slate-200 rounded-sm p-6 shadow-2xs space-y-4">
        <div className="w-10 h-10 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />

        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-wide">
            Reading prescription...
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Extracting medication items, strengths, and dosage forms.
          </p>
        </div>

        {/* Normal progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
          <div
            className="bg-slate-800 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          {progress}% completed
        </div>
      </div>
    </div>
  );
};
