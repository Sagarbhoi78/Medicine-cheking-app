import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Eye, EyeOff, Lock, User, Building2, KeyRound } from 'lucide-react';
import { INITIAL_USERS } from '../services/mockData';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [organizationId, setOrganizationId] = useState('METRO-HEALTH-CENTRAL');
  const [staffId, setStaffId] = useState('PHARM-401');
  const [password, setPassword] = useState('pharmacist123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const result = await login(organizationId, staffId, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Authentication failed.');
    }
  };

  const handleQuickSwitch = (u: typeof INITIAL_USERS[0], pass: string) => {
    setStaffId(u.staffId);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-md w-full mx-auto bg-white border border-slate-300 rounded-md shadow-xs p-6">
        {/* App Title */}
        <div className="flex items-center space-x-2.5 mb-5 pb-4 border-b border-slate-200">
          <div className="w-9 h-9 bg-emerald-700 text-white rounded-xs flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              SMART-MED SAFE
            </h1>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider">
              Medication Verification System
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Hospital Staff Sign In</h2>
          <p className="text-xs text-slate-500">
            Sign in with your clinical credentials to access pharmacy station.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Organization ID */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Hospital / Organization ID</span>
            </label>
            <input
              type="text"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              placeholder="e.g. METRO-HEALTH-CENTRAL"
              className="w-full px-3 py-2 border border-slate-300 rounded-xs bg-slate-50/50 text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              required
            />
          </div>

          {/* Staff ID */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Staff ID or Clinical Email</span>
            </label>
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="e.g. PHARM-401 or email"
              className="w-full px-3 py-2 border border-slate-300 rounded-xs bg-slate-50/50 text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-slate-400" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-xs bg-slate-50/50 text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              required
            />
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xs text-[11px]">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-60"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Station'}</span>
          </button>
        </form>

        {/* Quick Demo Staff Selector */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2">
            Demo Evaluation Roles (Quick Select)
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickSwitch(INITIAL_USERS[0], 'pharmacist123')}
              className={`p-1.5 border rounded-xs text-left transition-colors ${
                staffId === 'PHARM-401'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-semibold truncate">Pharmacist</div>
              <div className="text-[10px] text-slate-500 font-mono">PHARM-401</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSwitch(INITIAL_USERS[1], 'supervisor123')}
              className={`p-1.5 border rounded-xs text-left transition-colors ${
                staffId === 'SUP-108'
                  ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-semibold truncate">Supervisor</div>
              <div className="text-[10px] text-slate-500 font-mono">SUP-108</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSwitch(INITIAL_USERS[2], 'admin123')}
              className={`p-1.5 border rounded-xs text-left transition-colors ${
                staffId === 'ADM-001'
                  ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-semibold truncate">Admin</div>
              <div className="text-[10px] text-slate-500 font-mono">ADM-001</div>
            </button>
          </div>
        </div>

        <div className="mt-4 text-[10px] text-slate-400 text-center">
          Hospital Dispensing Safety Protocol · Offline Mode Supported
        </div>
      </div>
    </div>
  );
};
