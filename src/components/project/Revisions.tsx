import React from 'react';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { Revision } from '../../types';

interface ProjectRevisionsProps {
  revisions: Revision[];
  isEditMode: boolean;
  onUpdate: (revisions: Revision[]) => void;
}

const ProjectRevisions: React.FC<ProjectRevisionsProps> = ({ revisions, isEditMode, onUpdate }) => {
  const handleAdd = () => {
    const newItem: Revision = {
      id: crypto.randomUUID(),
      round: revisions.length + 1,
      title: 'Nueva ronda de feedback',
      comment: '',
      status: 'pending',
      date: new Date().toISOString(),
    };
    onUpdate([...revisions, newItem]);
  };

  const handleUpdate = (id: string, fields: Partial<Revision>) => {
    onUpdate(revisions.map(r => r.id === id ? { ...r, ...fields } : r));
  };

  const handleDelete = (id: string) => {
    onUpdate(revisions.filter(r => r.id !== id));
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-dark flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Revisiones y Feedback
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {revisions.filter(r => r.status === 'incorporated').length} de {Math.max(revisions.length, 3)} rondas
          </span>
          {isEditMode && (
            <button onClick={handleAdd} className="btn-secondary py-1.5 text-xs flex items-center gap-1">
              <Plus className="w-3 h-3" /> Agregar ronda
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {revisions.map((rev) => (
          <div key={rev.id} className="card p-5 border-l-4 border-l-primary/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-1 rounded shrink-0">ROUND {rev.round}</span>
                {isEditMode ? (
                  <input
                    value={rev.title}
                    onChange={(e) => handleUpdate(rev.id, { title: e.target.value })}
                    className="font-bold text-dark bg-transparent border-b border-gray-100 focus:border-primary outline-none"
                  />
                ) : (
                  <h4 className="font-bold text-dark">{rev.title}</h4>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400">{format(new Date(rev.date), 'dd/MM/yy')}</span>
                {isEditMode ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={rev.status}
                      onChange={(e) => handleUpdate(rev.id, { status: e.target.value as Revision['status'] })}
                      className="text-xs rounded border-gray-200"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="incorporated">Incorporado</option>
                    </select>
                    <button onClick={() => handleDelete(rev.id)} className="text-gray-300 hover:text-danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className={`badge ${rev.status === 'incorporated' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}`}>
                    {rev.status === 'incorporated' ? 'Incorporado' : 'Pendiente'}
                  </span>
                )}
              </div>
            </div>

            {isEditMode ? (
              <textarea
                value={rev.comment}
                onChange={(e) => handleUpdate(rev.id, { comment: e.target.value })}
                className="bg-gray-50 border border-gray-100 rounded-lg p-3 w-full text-sm h-24"
                placeholder="Escribí los comentarios del cliente..."
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 italic">
                "{rev.comment || 'Sin comentarios registrados aún.'}"
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectRevisions;
