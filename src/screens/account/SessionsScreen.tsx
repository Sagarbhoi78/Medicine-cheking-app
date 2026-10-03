import React from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, Tablet, LogOut, CheckCircle2 } from 'lucide-react';

export const SessionsScreen: React.FC = () => {
  const { sessions, terminateSession, terminateAllOtherSessions } = useApp();

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Sessions & Devices
        </h1>
        <p className="text-[11px] text-slate-500">
          Authorized terminals and handheld devices currently logged into your account
        </p>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`bg-white border rounded-sm p-4 shadow-2xs space-y-2 ${
              session.isCurrent ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-xs shrink-0 mt-0.5">
                  {session.platform === 'Android' ? (
                    <Smartphone className="w-4 h-4" />
                  ) : session.platform === 'Terminal' ? (
                    <Monitor className="w-4 h-4" />
                  ) : (
                    <Tablet className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{session.device}</span>
                    {session.isCurrent && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-xs flex items-center space-x-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Current</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {session.browser} · IP: {session.ipAddress}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Activity: {session.lastActive}
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => terminateSession(session.id)}
                  className="px-2.5 py-1 text-red-700 hover:bg-red-50 border border-red-200 rounded-xs text-[11px] font-semibold flex items-center space-x-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {sessions.length > 1 && (
        <div className="pt-2">
          <button
            onClick={terminateAllOtherSessions}
            className="w-full py-2 bg-white border border-red-300 hover:bg-red-50 text-red-700 font-semibold text-xs rounded-xs flex items-center justify-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out All Other Devices</span>
          </button>
        </div>
      )}
    </div>
  );
};
