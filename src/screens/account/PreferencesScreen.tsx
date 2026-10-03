import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon, Laptop, Volume2, Sparkles, Smartphone, Check } from 'lucide-react';
import { clinicalAudio } from '../../services/audioFeedback';

export const PreferencesScreen: React.FC = () => {
  const {
    theme,
    setTheme,
    reducedMotion,
    setReducedMotion,
    soundEnabled,
    setSoundEnabled,
    hapticEnabled,
    setHapticEnabled,
  } = useApp();

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-5 overflow-y-auto space-y-4 transition-colors">
      <div>
        <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
          Application Preferences
        </h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Appearance, tactile audio feedback, and accessibility settings
        </p>
      </div>

      <div className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        {/* Appearance / Theme Mode */}
        <div className="p-4 space-y-2.5">
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Appearance & Theme
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select daylight hospital terminal or high-contrast night shift workstation theme.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-2.5 rounded-md border flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-700 dark:border-teal-500 text-teal-900 dark:text-teal-200 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-600" />
              <span className="text-[11px]">Light</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-2.5 rounded-md border flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-700 dark:border-teal-500 text-teal-900 dark:text-teal-200 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <Moon className="w-4 h-4 text-slate-400" />
              <span className="text-[11px]">Dark</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-2.5 rounded-md border flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
                theme === 'system'
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-700 dark:border-teal-500 text-teal-900 dark:text-teal-200 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <Laptop className="w-4 h-4 text-slate-500" />
              <span className="text-[11px]">System</span>
            </button>
          </div>
        </div>

        {/* Audible Verification Chimes */}
        <div className="p-4 flex items-center justify-between">
          <div className="space-y-0.5 pr-3">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Audible Verification Chime
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Plays a subtle calibrated dual-frequency chime on match and a low warning tone on mismatch.
            </p>
          </div>
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) clinicalAudio.playVerifiedChime();
            }}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
              soundEnabled ? 'bg-teal-700 dark:bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Tactile Haptic Feedback */}
        <div className="p-4 flex items-center justify-between">
          <div className="space-y-0.5 pr-3">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Haptic Vibration
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Tactile vibration confirmation on handheld barcode capture.
            </p>
          </div>
          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
              hapticEnabled ? 'bg-teal-700 dark:bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                hapticEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="p-4 flex items-center justify-between">
          <div className="space-y-0.5 pr-3">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Reduced Motion (Accessibility)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Disables non-essential optical transitions and rapid scanning line movement.
            </p>
          </div>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
              reducedMotion ? 'bg-teal-700 dark:bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                reducedMotion ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Clinical Language */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Formulary Terminology Standard
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              International Pharmacopoeia (IP / USP / BP)
            </div>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-xs">
            Standard English
          </span>
        </div>
      </div>
    </div>
  );
};
