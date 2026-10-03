import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Search, CheckCircle2, Shield, Clock } from 'lucide-react';

export const SupervisorTeamScreen: React.FC = () => {
  const { teamMembers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeam = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      m.staffId.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Pharmacy Team Operational Status
        </h1>
        <p className="text-[11px] text-slate-500">
          Real-time activity and dispensing verification volume per pharmacist
        </p>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team member name or staff ID..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xs text-xs bg-slate-50 text-slate-900"
          />
        </div>
      </div>

      {/* Team Cards List */}
      <div className="space-y-2.5">
        {filteredTeam.map((member) => (
          <div
            key={member.staffId}
            className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                  {member.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">{member.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {member.role} · Staff ID: {member.staffId}
                  </div>
                </div>
              </div>

              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase font-mono">
                {member.status}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Today Scans</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{member.todayVerifications}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Mismatches</span>
                <span className="font-bold text-red-700 font-mono text-sm">{member.mismatchesDetected}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Activity</span>
                <span className="text-slate-600 font-mono text-[10px] block mt-0.5">{member.lastActiveTime}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
              <span>Department:</span>
              <span className="font-medium text-slate-800">{member.department}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
