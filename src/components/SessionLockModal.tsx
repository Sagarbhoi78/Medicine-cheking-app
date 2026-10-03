import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Shield, ArrowRight } from 'lucide-react';

export const SessionLockModal: React.FC = () => {
  const { isSessionLocked, currentUser, unlockSession, logout } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isSessionLocked || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockSession(password);
    if (!success) {
      setError(true);
    } else {
      setError(false);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-sm w-full p-6 shadow-2xl border border-slate-300 text-center">
        <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-700">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="font-semibold text-base text-slate-900 uppercase tracking-wide">
          Terminal Locked
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Hospital security policy: Station locked due to inactivity. Enter credentials to resume.
        </p>

        {/* User Card */}
        <div className="my-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex items-center space-x-3 text-left">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-xs text-slate-900 truncate">{currentUser.name}</div>
            <div className="text-[11px] text-slate-500 font-mono">
              {currentUser.staffId} · {currentUser.role}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter staff password or PIN"
              className="w-full px-3 py-2 border border-slate-300 rounded-xs text-sm text-center font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              autoFocus
              required
            />
            {error && (
              <p className="text-red-600 text-[11px] mt-1">
                Incorrect password. Default: pharmacist123 / supervisor123
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-slate-900 text-white font-semibold text-xs rounded-xs hover:bg-slate-800 flex items-center justify-center space-x-1"
          >
            <span>Unlock Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={logout}
            className="text-[11px] text-slate-500 hover:text-red-700 underline mt-2 block mx-auto"
          >
            Sign out of this station
          </button>
        </form>
      </div>
    </div>
  );
};
