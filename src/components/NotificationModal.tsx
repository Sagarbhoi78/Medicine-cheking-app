import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, CheckCheck, ShieldAlert, FileText, CheckCircle2, Clock } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, navigateToDeepScreen, setSupervisorTab } = useApp();

  if (!isOpen) return null;

  const handleNotificationClick = (item: (typeof notifications)[0]) => {
    markNotificationAsRead(item.id);
    if (item.type === 'OVERRIDE_REQUEST') {
      setSupervisorTab('requests');
      onClose();
    } else if (item.type === 'REVIEW_REQUIRED') {
      navigateToDeepScreen('prescription-detail');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-sm w-full border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-xs uppercase tracking-wider">
              Clinical Notifications
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[10px] text-slate-300 hover:text-white flex items-center space-x-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Mark Read</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3 rounded-xs border transition-colors cursor-pointer ${
                item.isRead
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-emerald-50/40 border-emerald-300 text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-1.5">
                  {item.type === 'OVERRIDE_REQUEST' && <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  {item.type === 'REVIEW_REQUIRED' && <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  {item.type === 'VERIFICATION_COMPLETE' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  {item.type === 'SECURITY' && <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                  <span className="font-bold text-xs">{item.title}</span>
                </div>
                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg in-emerald-600 shrink-0 mt-1" />
                )}
              </div>
              <p className="text-[11px] mt-1 text-slate-600 leading-relaxed">
                {item.message}
              </p>
              <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
                {item.timestamp}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No notifications at this time.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-xs hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
