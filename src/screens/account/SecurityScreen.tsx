import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  KeyRound,
  Fingerprint,
  Clock,
  Check,
  AlertCircle,
  Smartphone,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const SecurityScreen: React.FC = () => {
  const {
    currentUser,
    inactivityTimerMinutes,
    setInactivityTimerMinutes,
    addAuditRecord,
    navigateToDeepScreen,
    sessions,
  } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error: boolean } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatusMessage({ text: 'Password must be at least 6 characters long.', error: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ text: 'New passwords do not match.', error: true });
      return;
    }

    addAuditRecord(
      'SETTINGS_UPDATED',
      'SECURITY',
      currentUser?.staffId || 'USER',
      'Staff password changed successfully.'
    );
    setStatusMessage({ text: 'Password successfully updated.', error: false });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 sm:p-5 overflow-y-auto space-y-4 transition-colors">
      <div>
        <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
          Security & Access Settings
        </h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Terminal credentials, biometric policy, active sessions, and station timeout
        </p>
      </div>

      {/* Account Security Overview Banner */}
      <div className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Account Security Status
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              High Protection · Role: {currentUser?.role}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Last login: {currentUser?.lastLogin || 'Today'}
        </span>
      </div>

      {/* Active Sessions & Devices Quick Link */}
      <div
        onClick={() => navigateToDeepScreen('account-sessions')}
        className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Active Sessions & Devices
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {sessions.length} authorized terminals · Manage remote sessions
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Inactivity Timeout Policy */}
      <div className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-2.5">
        <div className="flex items-center space-x-2 pb-1 border-b border-slate-100 dark:border-slate-800">
          <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Inactivity Timeout Policy
          </h2>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          Workstation automatically locks upon inactivity to prevent unauthorized access to patient medication orders.
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Lock Workstation After:</span>
          <select
            value={inactivityTimerMinutes}
            onChange={(e) => {
              setInactivityTimerMinutes(Number(e.target.value));
              addAuditRecord('SETTINGS_UPDATED', 'SECURITY', 'SYSTEM', `Timeout adjusted to ${e.target.value} minutes.`);
            }}
            className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
          >
            <option value={2}>2 Minutes (Strict Clinical)</option>
            <option value={5}>5 Minutes (Standard Policy)</option>
            <option value={15}>15 Minutes (Extended)</option>
            <option value={30}>30 Minutes</option>
          </select>
        </div>
      </div>

      {/* Biometric Unlock */}
      <div className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Fingerprint className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Biometric Touch Unlock</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Fast station unlocking using device fingerprint/sensor</div>
          </div>
        </div>

        <button
          onClick={() => setBiometricEnabled(!biometricEnabled)}
          className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
            biometricEnabled ? 'bg-teal-700 dark:bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              biometricEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Change Password Form */}
      <div className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 pb-1 border-b border-slate-100 dark:border-slate-800">
          <KeyRound className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Change Password
          </h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          {statusMessage && (
            <div
              className={`p-2.5 rounded-md text-[11px] flex items-center space-x-1.5 ${
                statusMessage.error
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
              }`}
            >
              {statusMessage.error ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold rounded-md shadow-2xs cursor-pointer transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
