import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Shield,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Clock,
  LogOut,
  Sliders,
  CheckCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { clinicalAudio } from '../services/audioFeedback';

export const SettingsScreen: React.FC = () => {
  const {
    currentUser,
    logout,
    lockSession,
    soundEnabled,
    setSoundEnabled,
    hapticEnabled,
    setHapticEnabled,
    inactivityTimerMinutes,
    setInactivityTimerMinutes,
    esp32Status,
    toggleESP32,
    setAdminTab,
  } = useApp();

  const [testTonePlayed, setTestTonePlayed] = useState(false);

  const handleTestGreenTone = () => {
    clinicalAudio.playVerifiedChime();
    setTestTonePlayed(true);
    setTimeout(() => setTestTonePlayed(false), 800);
  };

  const handleTestRedTone = () => {
    clinicalAudio.playMismatchAlert();
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Top Header */}
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Station Settings
        </h1>
        <p className="text-[11px] text-slate-500">
          Account credentials, scanner configuration, and hardware connection
        </p>
      </div>

      {/* 1. Account Section */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <User className="w-4 h-4 text-slate-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Staff Account & Role
          </h2>
        </div>

        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-500">Staff Name:</span>
            <span className="font-semibold text-slate-900">{currentUser?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Staff Identifier:</span>
            <span className="font-mono font-semibold text-slate-900">{currentUser?.staffId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Authorized Role:</span>
            <span className="font-semibold text-slate-900">{currentUser?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Organization:</span>
            <span className="text-slate-800">{currentUser?.organizationId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Department:</span>
            <span className="text-slate-800">{currentUser?.department}</span>
          </div>
        </div>

        <div className="pt-2 flex space-x-2">
          <button
            onClick={lockSession}
            className="flex-1 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xs flex items-center justify-center space-x-1"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Terminal</span>
          </button>
          <button
            onClick={logout}
            className="flex-1 py-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs rounded-xs flex items-center justify-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. ESP32 Hardware Integration */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Physical ESP32 Module
            </h2>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs ${
              esp32Status.connected
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {esp32Status.connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Hardware IP:</span>
            <span className="font-mono text-slate-800">{esp32Status.ipAddress}</span>
          </div>
          <div className="flex justify-between">
            <span>Signal Mode:</span>
            <span className="font-mono text-slate-800">{esp32Status.signalMode}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Indicators:</span>
            <span className="text-slate-800">GREEN LED (Pass) / RED LED + Buzzer (Mismatch)</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            onClick={() => toggleESP32()}
            className={`py-1.5 px-3 rounded-xs text-xs font-semibold border ${
              esp32Status.connected
                ? 'border-red-300 text-red-700 hover:bg-red-50'
                : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {esp32Status.connected ? 'Simulate Disconnect' : 'Connect ESP32 Module'}
          </button>

          <div className="flex space-x-1.5">
            <button
              onClick={handleTestGreenTone}
              className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs text-[11px] font-semibold"
            >
              Test Green
            </button>
            <button
              onClick={handleTestRedTone}
              className="py-1 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xs text-[11px] font-semibold"
            >
              Test Red/Buzzer
            </button>
          </div>
        </div>
      </div>

      {/* 3. Audio & Scanner Feedback */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <Volume2 className="w-4 h-4 text-slate-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Scanner & Audible Feedback
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">Audible Verification Chime</div>
              <div className="text-[11px] text-slate-500">
                Play subtle dual-frequency clinical confirmation chime on scan
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-xs border ${
                soundEnabled ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-400 border-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <div className="font-semibold text-slate-800">Station Inactivity Timeout</div>
              <div className="text-[11px] text-slate-500">
                Automatically lock screen if untouched to protect patient records
              </div>
            </div>
            <select
              value={inactivityTimerMinutes}
              onChange={(e) => setInactivityTimerMinutes(Number(e.target.value))}
              className="px-2 py-1 border border-slate-300 rounded-xs text-xs bg-white text-slate-900"
            >
              <option value={2}>2 Minutes</option>
              <option value={5}>5 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Audit Trail & Compliance */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Pharmacy Audit Logs
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Immutable log of all user logins, scans, and supervisor overrides
          </div>
        </div>
        <button
          onClick={() => setAdminTab('audit')}
          className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xs hover:bg-slate-800"
        >
          View Audit Logs
        </button>
      </div>

      {/* About Box */}
      <div className="text-[10px] text-slate-400 text-center font-mono py-2">
        SMART-MED SAFE Hospital Pharmacy System · Build 2026.10.03
      </div>
    </div>
  );
};
