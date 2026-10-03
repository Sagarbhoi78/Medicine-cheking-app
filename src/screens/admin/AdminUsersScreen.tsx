import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { Users, Search, Shield, ChevronRight, X, Check, AlertTriangle, Lock } from 'lucide-react';

export const AdminUsersScreen: React.FC = () => {
  const { allUsers, updateUserRole, toggleUserStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = allUsers.filter((u) => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      u.staffId.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesRole && matchesSearch;
  });

  const handleRoleChange = (newRole: UserRole) => {
    if (!selectedUser) return;
    updateUserRole(selectedUser.id, newRole);
    setSelectedUser({ ...selectedUser, role: newRole });
  };

  const handleToggleStatus = () => {
    if (!selectedUser) return;
    const nextStatus = selectedUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    toggleUserStatus(selectedUser.id);
    setSelectedUser({ ...selectedUser, status: nextStatus });
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Hospital User & Role Administration
        </h1>
        <p className="text-[11px] text-slate-500">
          Provision staff accounts, clinical privileges, and station permissions
        </p>
      </div>

      {/* Search & Role Filter */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff name, email, or ID..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xs text-xs bg-slate-50 text-slate-900"
          />
        </div>

        <div className="flex space-x-1.5 text-xs">
          {['ALL', 'PHARMACIST', 'SUPERVISOR', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-2 py-0.8 rounded-xs font-semibold text-[10px] uppercase transition-colors ${
                filterRole === role
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs hover:border-slate-400 cursor-pointer transition-colors flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user.initials}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900">{user.name}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase ${
                      user.role === 'SUPERVISOR'
                        ? 'bg-amber-100 text-amber-900'
                        : user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {user.staffId} · {user.email}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs uppercase font-mono ${
                  user.status === 'ACTIVE'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-red-700 bg-red-50'
                }`}
              >
                {user.status}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-sm p-6 text-center text-xs text-slate-500">
            No hospital staff records match your search or filter.
          </div>
        )}
      </div>

      {/* User Detail / Privilege Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-sm w-full border border-slate-300 shadow-xl overflow-hidden flex flex-col space-y-4 p-5 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center">
                  {selectedUser.initials}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{selectedUser.name}</h3>
                  <div className="text-slate-500 text-[11px] font-mono">{selectedUser.staffId}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-800 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span>{selectedUser.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Status:</span>
                <span className="font-bold">{selectedUser.status}</span>
              </div>
            </div>

            {/* Change Role Section */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label className="block font-bold text-slate-800 text-[11px] uppercase">
                Assign Clinical Role:
              </label>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                {(['PHARMACIST', 'SUPERVISOR', 'ADMIN'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`py-1.5 rounded-xs border font-semibold ${
                      selectedUser.role === r
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Enable / Suspend */}
            <div className="pt-2 flex space-x-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`flex-1 py-2 text-xs font-semibold rounded-xs border ${
                  selectedUser.status === 'ACTIVE'
                    ? 'border-red-300 text-red-700 hover:bg-red-50'
                    : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {selectedUser.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
