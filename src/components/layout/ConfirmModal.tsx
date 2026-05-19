import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'primary',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${
              type === 'danger' ? 'bg-red-50 text-danger' : 
              type === 'warning' ? 'bg-orange-50 text-accent' : 
              'bg-primary-light text-primary'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button onClick={onCancel} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        
        <div className="bg-gray-50 p-4 flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 btn-secondary py-3"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 btn py-3 text-white font-bold ${
              type === 'danger' ? 'bg-danger hover:bg-red-700 shadow-lg shadow-red-900/20' : 
              type === 'warning' ? 'bg-accent hover:bg-orange-700 shadow-lg shadow-orange-900/20' : 
              'bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
