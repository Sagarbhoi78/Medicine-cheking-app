import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, User, Mail, Phone, Building2, Check } from 'lucide-react';

export const ProfileEditScreen: React.FC = () => {
  const { currentUser, updateUserProfile, navigateBackFromDeepScreen } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [title, setTitle] = useState(currentUser?.title || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      title: title.trim(),
      phone: phone.trim(),
      department: department.trim(),
      initials: name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigateBackFromDeepScreen();
    }, 600);
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Edit Profile Information
        </h1>
        <p className="text-[11px] text-slate-500">
          Update personal and departmental contact details
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3.5 text-xs text-slate-800">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-xs bg-slate-50 text-slate-900 font-medium"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Clinical Title / Designation</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-xs bg-slate-50 text-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Hospital Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-xs bg-slate-50 text-slate-900 font-mono"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Direct Contact Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-xs bg-slate-50 text-slate-900 font-mono"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Assigned Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-xs bg-slate-50 text-slate-900"
          />
        </div>

        <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
          <button
            type="button"
            onClick={navigateBackFromDeepScreen}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xs flex items-center space-x-1.5"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
