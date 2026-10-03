import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Database, Smartphone, FileSpreadsheet, ShieldAlert, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';

export const AdminDashboardScreen: React.FC = () => {
  const { allUsers, formulary, esp32Status, auditLogs, setAdminTab } = useApp();

  const activeUsersCount = allUsers.filter((u) => u.status === 'ACTIVE').length;

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-xs inline-block border border-purple-200 mb-1">
              System Administration
            </div>
            <h1 className="text-base font-bold text-slate-900">
              Pharmacy Informatics Console
            </h1>
            <p className="text-xs text-slate-500">
              Hospital tenant: ABC Pharmacy - Central Hospital
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 border border-purple-300 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 4 Core Admin Management Cards */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Users Card */}
        <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xs bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-900">Hospital Users</h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {activeUsersCount} Active Accounts
            </p>
          </div>
          <button
            onClick={() => setAdminTab('users')}
            className="mt-3 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xs font-semibold text-[11px] flex items-center justify-between"
          >
            <span>Manage Users</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Medicine Formulary Card */}
        <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xs bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-900">Formulary Database</h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {formulary.length} Verified GTINs
            </p>
          </div>
          <button
            onClick={() => setAdminTab('medicines')}
            className="mt-3 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xs font-semibold text-[11px] flex items-center justify-between"
          >
            <span>Formulary</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Hardware Devices Card */}
        <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xs bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
              <Smartphone className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-900">Station Hardware</h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              ESP32: {esp32Status.connected ? 'Online' : 'Offline'}
            </p>
          </div>
          <button
            onClick={() => setAdminTab('account')}
            className="mt-3 py-1.5 px-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xs font-semibold text-[11px] flex items-center justify-between"
          >
            <span>Config</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Audit Logs Card */}
        <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xs bg-purple-50 text-purple-700 flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-900">Audit Trail</h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {auditLogs.length} Security Events
            </p>
          </div>
          <button
            onClick={() => setAdminTab('audit')}
            className="mt-3 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xs font-semibold text-[11px] flex items-center justify-between"
          >
            <span>View Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Recent Security & System Activity */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Recent System Security Events
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Immutable</span>
        </div>

        <div className="space-y-2 text-xs">
          {auditLogs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900">{log.action.replace(/_/g, ' ')}</div>
                <div className="text-[11px] text-slate-600 line-clamp-1">{log.details}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {log.staffName} ({log.role})
                </div>
              </div>
              <span className="text-[9px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.5 rounded-xs shrink-0 ml-2">
                {log.entityType}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
