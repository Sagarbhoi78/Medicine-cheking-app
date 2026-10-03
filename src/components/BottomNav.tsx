import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  FileText,
  Clock,
  User,
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
  Users,
  Database,
  FileSpreadsheet,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    currentUser,
    pharmacistTab,
    supervisorTab,
    adminTab,
    setPharmacistTab,
    setSupervisorTab,
    setAdminTab,
    prescriptions,
    overrideRequests,
  } = useApp();

  if (!currentUser) return null;

  // Counts for pending badges
  const pendingRxCount = prescriptions.filter(
    (p) => p.status === 'ACTIVE' || p.status === 'PENDING_REVIEW'
  ).length;

  const pendingRequestsCount = overrideRequests.filter(
    (r) => r.status === 'PENDING'
  ).length;

  return (
    <nav className="bg-white dark:bg-slate-950 border-t border-slate-200/90 dark:border-slate-800 px-2 py-1 flex items-center justify-around select-none shrink-0 z-30 shadow-xs transition-colors">
      {/* 1. PHARMACIST NAVIGATION: Home | Prescriptions | History | Account */}
      {currentUser.role === 'PHARMACIST' && (
        <>
          <button
            onClick={() => setPharmacistTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-md transition-colors min-w-[64px] cursor-pointer ${
              pharmacistTab === 'home'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Home
              className={`w-4 h-4 ${
                pharmacistTab === 'home' ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300' : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setPharmacistTab('prescriptions')}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-md transition-colors min-w-[64px] cursor-pointer ${
              pharmacistTab === 'prescriptions'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileText
              className={`w-4 h-4 ${
                pharmacistTab === 'prescriptions'
                  ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300'
                  : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Prescriptions</span>
            {pendingRxCount > 0 && (
              <span className="absolute top-0.5 right-2.5 bg-teal-800 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center ring-1 ring-white dark:ring-slate-900">
                {pendingRxCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setPharmacistTab('history')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-md transition-colors min-w-[64px] cursor-pointer ${
              pharmacistTab === 'history'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Clock
              className={`w-4 h-4 ${
                pharmacistTab === 'history' ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300' : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">History</span>
          </button>

          <button
            onClick={() => setPharmacistTab('account')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-md transition-colors min-w-[64px] cursor-pointer ${
              pharmacistTab === 'account'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <User
              className={`w-4 h-4 ${
                pharmacistTab === 'account' ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300' : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Account</span>
          </button>
        </>
      )}

      {/* 2. SUPERVISOR NAVIGATION: Overview | Verifications | Requests | Team | Account */}
      {currentUser.role === 'SUPERVISOR' && (
        <>
          <button
            onClick={() => setSupervisorTab('overview')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[54px] cursor-pointer ${
              supervisorTab === 'overview'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard
              className={`w-4 h-4 ${
                supervisorTab === 'overview'
                  ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300'
                  : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Overview</span>
          </button>

          <button
            onClick={() => setSupervisorTab('verifications')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[54px] cursor-pointer ${
              supervisorTab === 'verifications'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ClipboardList
              className={`w-4 h-4 ${
                supervisorTab === 'verifications'
                  ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300'
                  : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Verifications</span>
          </button>

          <button
            onClick={() => setSupervisorTab('requests')}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[54px] cursor-pointer ${
              supervisorTab === 'requests'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <AlertCircle
              className={`w-4 h-4 ${
                supervisorTab === 'requests'
                  ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300'
                  : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute top-0.5 right-1.5 bg-amber-600 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center ring-1 ring-white dark:ring-slate-900">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSupervisorTab('team')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[54px] cursor-pointer ${
              supervisorTab === 'team'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users
              className={`w-4 h-4 ${
                supervisorTab === 'team' ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300' : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Team</span>
          </button>

          <button
            onClick={() => setSupervisorTab('account')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[54px] cursor-pointer ${
              supervisorTab === 'account'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <User
              className={`w-4 h-4 ${
                supervisorTab === 'account'
                  ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300'
                  : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Account</span>
          </button>
        </>
      )}

      {/* 3. ADMIN NAVIGATION: Dashboard | Users | Medicines | Audit | Account */}
      {currentUser.role === 'ADMIN' && (
        <>
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[54px] cursor-pointer ${
              adminTab === 'dashboard'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard
              className={`w-4 h-4 ${
                adminTab === 'dashboard'
                  ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300'
                  : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Dashboard</span>
          </button>

          <button
            onClick={() => setAdminTab('users')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[54px] cursor-pointer ${
              adminTab === 'users'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users
              className={`w-4 h-4 ${
                adminTab === 'users' ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300' : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Users</span>
          </button>

          <button
            onClick={() => setAdminTab('medicines')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[54px] cursor-pointer ${
              adminTab === 'medicines'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Database
              className={`w-4 h-4 ${
                adminTab === 'medicines'
                  ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300'
                  : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Medicines</span>
          </button>

          <button
            onClick={() => setAdminTab('audit')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[54px] cursor-pointer ${
              adminTab === 'audit'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet
              className={`w-4 h-4 ${
                adminTab === 'audit' ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300' : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Audit Logs</span>
          </button>

          <button
            onClick={() => setAdminTab('account')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[54px] cursor-pointer ${
              adminTab === 'account'
                ? 'text-teal-800 dark:text-teal-300 font-semibold bg-teal-50/70 dark:bg-teal-950/40'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <User
              className={`w-4 h-4 ${
                adminTab === 'account' ? 'stroke-[2.4px] text-teal-800 dark:text-teal-300' : 'stroke-2'
              }`}
            />
            <span className="text-[10px] mt-0.5">Account</span>
          </button>
        </>
      )}
    </nav>
  );
};
