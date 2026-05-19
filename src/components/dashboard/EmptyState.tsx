import React from 'react';
import { FolderPlus } from 'lucide-react';

interface EmptyStateProps {
  onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAction }) => {
  return (
    <div className="card bg-white p-12 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6">
        <FolderPlus className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-dark mb-2">Todavía no tenés proyectos</h2>
      <p className="text-gray-500 max-w-sm mb-8">
        Comenzá a organizar tus proyectos freelance hoy mismo. Creá tu primer proyecto para ver las estadísticas.
      </p>
      <button 
        onClick={onAction}
        className="btn-primary"
      >
        Crear el primero
      </button>
    </div>
  );
};

export default EmptyState;
