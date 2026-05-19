import React from 'react';
import { Pin } from 'lucide-react';

interface NoticePinProps {
  notice: string;
  isEditMode: boolean;
  onChange: (value: string) => void;
}

const NoticePin: React.FC<NoticePinProps> = ({ notice, isEditMode, onChange }) => {
  if (!isEditMode && !notice) return null;

  return (
    <div className="bg-accent-light border border-accent-mid rounded-std p-4 mb-8 flex gap-3">
      <div className="bg-accent p-2 rounded-lg h-fit">
        <Pin className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Aviso pinneado</p>
        {isEditMode ? (
          <textarea 
            value={notice}
            onChange={(e) => onChange(e.target.value)}
            className="input w-full bg-white/50 border-accent/20 focus:border-accent focus:ring-accent/20"
            placeholder="Escribí un mensaje importante para tu cliente..."
          />
        ) : (
          <p className="text-dark font-medium">{notice}</p>
        )}
      </div>
    </div>
  );
};

export default NoticePin;
