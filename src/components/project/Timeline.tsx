import React from 'react';
import { Plus, Trash2, Calendar, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Phase } from '../../types';

interface ProjectTimelineProps {
  phases: Phase[];
  isEditMode: boolean;
  onUpdate: (phases: Phase[]) => void;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ phases, isEditMode, onUpdate }) => {
  const handleAddPhase = () => {
    const newPhase: Phase = {
      id: crypto.randomUUID(),
      name: 'Nueva Fase',
      description: 'Descripción de la fase...',
      status: 'pending',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    };
    onUpdate([...phases, newPhase]);
  };

  const handleUpdatePhase = (id: string, fields: Partial<Phase>) => {
    onUpdate(phases.map(p => p.id === id ? { ...p, ...fields } : p));
  };

  const handleDeletePhase = (id: string) => {
    onUpdate(phases.filter(p => p.id !== id));
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-dark flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Timeline del proyecto
        </h3>
        {isEditMode && (
          <button onClick={handleAddPhase} className="btn-secondary py-1.5 text-xs flex items-center gap-1">
            <Plus className="w-3 h-3" /> Agregar fase
          </button>
        )}
      </div>

      <div className="space-y-0 relative">
        {/* Linea conectora */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 z-0" />

        {phases.map((phase) => (
          <div key={phase.id} className="relative pl-10 pb-8 last:pb-0 z-10">
            {/* Dot */}
            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
              phase.status === 'done' ? 'bg-success' : 
              phase.status === 'active' ? 'bg-primary' : 'bg-gray-200'
            }`}>
              {phase.status === 'done' ? <CheckCircle2 className="w-4 h-4 text-white" /> : 
               phase.status === 'active' ? <PlayCircle className="w-4 h-4 text-white" /> : 
               <Clock className="w-4 h-4 text-white" />}
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                {isEditMode ? (
                  <input 
                    value={phase.name}
                    onChange={(e) => handleUpdatePhase(phase.id, { name: e.target.value })}
                    className="font-bold text-dark bg-transparent border-b border-gray-200 focus:border-primary outline-none"
                  />
                ) : (
                  <h4 className="font-bold text-dark">{phase.name}</h4>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                    {isEditMode ? (
                      <div className="flex gap-1">
                        <input 
                          type="date" 
                          value={format(new Date(phase.startDate), 'yyyy-MM-dd')}
                          onChange={(e) => handleUpdatePhase(phase.id, { startDate: new Date(e.target.value).toISOString() })}
                          className="bg-gray-50 border border-gray-200 rounded px-1 text-[10px]"
                        />
                        <span>-</span>
                        <input 
                          type="date" 
                          value={format(new Date(phase.endDate), 'yyyy-MM-dd')}
                          onChange={(e) => handleUpdatePhase(phase.id, { endDate: new Date(e.target.value).toISOString() })}
                          className="bg-gray-50 border border-gray-200 rounded px-1 text-[10px]"
                        />
                      </div>
                    ) : (
                      <span>{format(new Date(phase.startDate), 'dd/MM')} - {format(new Date(phase.endDate), 'dd/MM')}</span>
                    )}
                  </div>
                  
                  {isEditMode ? (
                    <select 
                      value={phase.status}
                      onChange={(e) => handleUpdatePhase(phase.id, { status: e.target.value as Phase['status'] })}
                      className="text-[10px] font-bold uppercase rounded border-gray-200 py-0.5"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="active">Activo</option>
                      <option value="done">Hecho</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      phase.status === 'done' ? 'bg-success-light text-success' : 
                      phase.status === 'active' ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {phase.status === 'done' ? 'Completado' : phase.status === 'active' ? 'En curso' : 'Pendiente'}
                    </span>
                  )}

                  {isEditMode && (
                    <button onClick={() => handleDeletePhase(phase.id)} className="p-1 text-gray-300 hover:text-danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {isEditMode ? (
                <textarea 
                  value={phase.description}
                  onChange={(e) => handleUpdatePhase(phase.id, { description: e.target.value })}
                  className="text-sm text-gray-500 bg-transparent border border-gray-100 rounded p-1 w-full h-16"
                />
              ) : (
                <p className="text-sm text-gray-500 leading-relaxed">{phase.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectTimeline;
