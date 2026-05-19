import React from 'react';
import { Info } from 'lucide-react';

const EditBanner: React.FC = () => {
  return (
    <div className="bg-primary px-6 py-2 flex items-center justify-center gap-2 text-white animate-in slide-in-from-top duration-300">
      <Info className="w-4 h-4" />
      <p className="text-sm font-medium">Modo edición activo — los cambios se guardan automáticamente.</p>
    </div>
  );
};

export default EditBanner;
