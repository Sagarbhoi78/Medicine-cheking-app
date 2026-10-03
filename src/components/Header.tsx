import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowLeft, Bell, Lock, Wifi, WifiOff } from 'lucide-react';
import { NotificationModal } from './NotificationModal';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentDeepScreen,
    navigateBackFromDeepScreen,
    notifications,
    setPharmacistTab,
    setSupervisorTab,
    setAdminTab,
    lockSession,
    isOnline,
  } = useApp();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  if (!currentUser) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleAvatarClick = () => {
    if (currentUser.role === 'PHARMACIST') setPharmacistTab('account');
    if (currentUser.role === 'SUPERVISOR') setSupervisorTab('account');
    if (currentUser.role === 'ADMIN') setAdminTab('account');
  };

  return (
    <>
      <header className="bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between select-none shrink-0 sticky top-0 z-30 transition-colors">
        {/* Left Side: Back button if on Deep Screen, or Hospital Branding */}
        <div className="flex items-center space-x-2.5">
          {currentDeepScreen ? (
            <button
              onClick={navigateBackFromDeepScreen}
              className="p-1 -ml-1 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md flex items-center space-x-1.5 transition-colors"
              title="Return to previous screen"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Back</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-teal-700 text-white rounded-md flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-teal-100" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-xs tracking-wider uppercase text-slate-100">
                    SMART-MED SAFE
                  </span>
                  <span className="text-[9px] bg-slate-800 text-teal-400 px-1 py-0.2 rounded font-mono font-semibold">
                    V4
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[130px] sm:max-w-[200px]">
                  {currentUser.organizationId}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Subtle Connectivity Status + Notifications + Avatar */}
        <div className="flex items-center space-x-2">
          {/* Subtle Online / Offline Status */}
          <div
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
              isOnline
                ? 'bg-slate-800/80 border-slate-700/80 text-emerald-400'
                : 'bg-red-950/60 border-red-800 text-red-400'
            }`}
            title={isOnline ? 'Station connected to hospital intranet' : 'Offline mode active - operations queued'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'
              }`}
            />
            <span className="text-[9px] font-medium hidden xs:inline">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md transition-colors"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar with Initials / Photo */}
          <button
            onClick={handleAvatarClick}
            className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/90 p-0.5 pr-1.5 rounded-full cursor-pointer transition-colors"
            title={`${currentUser.name} (${currentUser.role})`}
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-teal-400"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-teal-800 text-teal-100 font-bold text-[10px] flex items-center justify-center">
                {currentUser.initials}
              </div>
            )}
            <span className="text-[10px] font-semibold text-slate-200 uppercase hidden xs:inline">
              {currentUser.role === 'PHARMACIST' ? 'RPh' : currentUser.role === 'SUPERVISOR' ? 'SUP' : 'ADM'}
            </span>
          </button>

          {/* Session Lock */}
          <button
            onClick={lockSession}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Lock workstation session"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Notification Modal Drawer */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
};
