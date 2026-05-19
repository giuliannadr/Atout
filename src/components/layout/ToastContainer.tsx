import React from 'react';
import { useNotificationStore, type NotificationType } from '../../store/notificationStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

const ToastContainer: React.FC = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((n: Notification) => (
        <div
          key={n.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border min-w-[300px]
            animate-in slide-in-from-right-10 duration-300
            ${n.type === 'success' ? 'bg-white border-success-mid text-success' : ''}
            ${n.type === 'error' ? 'bg-white border-red-200 text-danger' : ''}
            ${n.type === 'info' ? 'bg-white border-primary-mid text-primary' : ''}
          `}
        >
          {n.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {n.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
          {n.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
          
          <p className="text-sm font-bold flex-1 text-dark">{n.message}</p>
          
          <button 
            onClick={() => removeNotification(n.id)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
