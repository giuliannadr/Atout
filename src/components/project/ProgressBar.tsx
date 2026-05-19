import React from 'react';

interface ProjectProgressBarProps {
  progress: number;
  currentStage: string;
  isEditMode: boolean;
  onUpdate: (fields: { progress?: number; currentStage?: string }) => void;
}

const ProjectProgressBar: React.FC<ProjectProgressBarProps> = ({ 
  progress, 
  currentStage, 
  isEditMode, 
  onUpdate 
}) => {
  return (
    <div className="card p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-dark">Progreso general</h3>
          {isEditMode ? (
            <input 
              value={currentStage}
              onChange={(e) => onUpdate({ currentStage: e.target.value })}
              className="text-sm text-gray-500 border-b border-gray-200 focus:border-primary outline-none"
              placeholder="Etapa actual..."
            />
          ) : (
            <p className="text-sm text-gray-500">{currentStage}</p>
          )}
        </div>
        <div className="text-2xl font-bold text-primary">{progress}%</div>
      </div>

      <div className="relative mb-8">
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {isEditMode && (
          <input 
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => onUpdate({ progress: Number(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        )}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {['Brief', 'Diseño', 'Dev', 'Test', 'Review', 'Launch'].map((step, i) => {
          const isActive = (i + 1) * 16.6 <= progress;
          return (
            <div key={step} className="flex flex-col items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary' : 'bg-gray-200'}`} />
              <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-dark' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectProgressBar;
