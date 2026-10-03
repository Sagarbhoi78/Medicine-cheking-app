import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Shield,
  Smartphone,
  Bell,
  Sliders,
  HelpCircle,
  FileText,
  Info,
  LogOut,
  ChevronRight,
  Camera,
  CheckCircle2,
  Building2,
  Mail,
  BadgeCheck,
} from 'lucide-react';
import { ProfilePhotoModal } from '../../components/ProfilePhotoModal';

export const AccountRootScreen: React.FC = () => {
  const { currentUser, logout, navigateToDeepScreen, switchRole, allUsers } = useApp();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
        <div className="flex items-center space-x-3.5">
          {/* Circular Avatar */}
          <div className="relative group shrink-0">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600 shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-800 text-white font-bold text-base flex items-center justify-center border-2 border-slate-700 shadow-xs">
                {currentUser.initials}
              </div>
            )}
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute bottom-0 right-0 bg-slate-900 hover:bg-slate-800 text-white p-1 rounded-full border border-white shadow-xs"
              title="Change Profile Photo"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-bold text-slate-900 truncate">
                {currentUser.name}
              </h1>
              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="text-xs font-semibold text-slate-600">
              {currentUser.title || currentUser.role}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Staff ID: {currentUser.staffId} · {currentUser.organizationId}
            </div>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-800 uppercase font-mono">
                {currentUser.status}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher for Hackathon Testing */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Switch Clinical Role Evaluation:
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              onClick={() => switchRole('PHARMACIST')}
              className={`py-1.5 px-2 rounded-xs border text-left transition-colors ${
                currentUser.role === 'PHARMACIST'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-[11px] font-bold">Pharmacist</div>
              <div className="text-[9px] text-slate-500 font-mono">Sagar Patel</div>
            </button>

            <button
              onClick={() => switchRole('SUPERVISOR')}
              className={`py-1.5 px-2 rounded-xs border text-left transition-colors ${
                currentUser.role === 'SUPERVISOR'
                  ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-[11px] font-bold">Supervisor</div>
              <div className="text-[9px] text-slate-500 font-mono">Dr. M. Vance</div>
            </button>

            <button
              onClick={() => switchRole('ADMIN')}
              className={`py-1.5 px-2 rounded-xs border text-left transition-colors ${
                currentUser.role === 'ADMIN'
                  ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-[11px] font-bold">Admin</div>
              <div className="text-[9px] text-slate-500 font-mono">Elena Rostova</div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PERSONAL INFORMATION */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2">
        <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-100">
          Personal Information
        </h2>
        <div className="text-xs space-y-2 pt-1 text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-500">Full Name:</span>
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email:</span>
            <span className="font-mono text-slate-800">{currentUser.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Staff ID:</span>
            <span className="font-mono font-semibold text-slate-900">{currentUser.staffId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Department:</span>
            <span className="text-slate-800">{currentUser.department}</span>
          </div>
        </div>
      </div>

      {/* 3. ACCOUNT NAVIGATION MENU */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs divide-y divide-slate-100">
        <div className="p-3 bg-slate-50/50">
          <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Account & Security
          </h2>
        </div>

        <button
          onClick={() => navigateToDeepScreen('account-profile')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <User className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-semibold text-slate-800">Edit Profile</div>
              <div className="text-[11px] text-slate-500">Change contact details and title</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigateToDeepScreen('account-security')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <Shield className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-semibold text-slate-800">Security & Authentication</div>
              <div className="text-[11px] text-slate-500">Password, biometric unlock, and timeout</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigateToDeepScreen('account-sessions')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <Smartphone className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-semibold text-slate-800">Sessions & Devices</div>
              <div className="text-[11px] text-slate-500">Active terminal logins and logout remote</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 4. PREFERENCES */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs divide-y divide-slate-100">
        <div className="p-3 bg-slate-50/50">
          <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Preferences
          </h2>
        </div>

        <button
          onClick={() => navigateToDeepScreen('account-preferences')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-semibold text-slate-800">App Preferences</div>
              <div className="text-[11px] text-slate-500">Reduced motion, sound chimes, haptics</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 5. SUPPORT & LEGAL */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs divide-y divide-slate-100">
        <div className="p-3 bg-slate-50/50">
          <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Support & Information
          </h2>
        </div>

        <button
          onClick={() => navigateToDeepScreen('account-help')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <div className="font-semibold text-slate-800">Help & Verification Workflows</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigateToDeepScreen('account-about')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <Info className="w-4 h-4 text-slate-500" />
            <div className="font-semibold text-slate-800">About SMART-MED SAFE V3</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigateToDeepScreen('account-privacy')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <FileText className="w-4 h-4 text-slate-500" />
            <div className="font-semibold text-slate-800">Privacy & Data Protection</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigateToDeepScreen('account-terms')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <FileText className="w-4 h-4 text-slate-500" />
            <div className="font-semibold text-slate-800">Terms of Use & Clinical Notice</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 6. LOGOUT BUTTON */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full py-2.5 bg-white border border-red-300 hover:bg-red-50 text-red-700 font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span>Log Out of Terminal</span>
        </button>
        <div className="text-[10px] text-slate-400 text-center font-mono mt-2">
          SMART-MED SAFE V3 · Hospital Safety Station
        </div>
      </div>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
};
