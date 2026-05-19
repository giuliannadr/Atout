import React from 'react';
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, User, Laptop } from 'lucide-react';
import { format } from 'date-fns';
import type { Deliverable } from '../../types';

interface ProjectDeliverablesProps {
  deliverables: Deliverable[];
  isEditMode: boolean;
  onUpdate: (deliverables: Deliverable[]) => void;
}

const ProjectDeliverables: React.FC<ProjectDeliverablesProps> = ({ deliverables, isEditMode, onUpdate }) => {
  const handleAdd = () => {
    const newItem: Deliverable = {
      id: crypto.randomUUID(),
      name: 'Nuevo entregable',
      note: '',
      responsible: 'dev',
      status: 'pending',
      dueDate: new Date().toISOString(),
    };
    onUpdate([...deliverables, newItem]);
  };

  const handleUpdate = (id: string, fields: Partial<Deliverable>) => {
    onUpdate(deliverables.map(d => d.id === id ? { ...d, ...fields } : d));
  };

  const handleDelete = (id: string) => {
    onUpdate(deliverables.filter(d => d.id !== id));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-primary" />;
      case 'waiting-client': return <AlertCircle className="w-4 h-4 text-accent" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-200" />;
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-dark flex items-center gap-2">
          <Laptop className="w-5 h-5 text-primary" />
          Entregables
        </h3>
        {isEditMode && (
          <button onClick={handleAdd} className="btn-secondary py-1.5 text-xs flex items-center gap-1">
            <Plus className="w-3 h-3" /> Agregar ítem
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-std overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ítem</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Responsable</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
              {isEditMode && <th className="px-6 py-3 w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deliverables.map((item) => (
              <tr 
                key={item.id} 
                className={`hover:bg-gray-50 transition-colors ${item.status === 'waiting-client' ? 'bg-accent-light/30' : ''}`}
              >
                <td className="px-6 py-4">
                  {isEditMode ? (
                    <div className="space-y-1">
                      <input 
                        value={item.name}
                        onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
                        className="font-bold text-dark bg-transparent border-b border-gray-200 focus:border-primary outline-none w-full"
                      />
                      <input 
                        value={item.note}
                        onChange={(e) => handleUpdate(item.id, { note: e.target.value })}
                        className="text-xs text-gray-400 bg-transparent outline-none w-full"
                        placeholder="Nota..."
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-dark">{item.name}</p>
                      {item.note && <p className="text-xs text-gray-400">{item.note}</p>}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {isEditMode ? (
                    <select 
                      value={item.responsible}
                      onChange={(e) => handleUpdate(item.id, { responsible: e.target.value as Deliverable['responsible'] })}
                      className="text-xs rounded border-gray-200"
                    >
                      <option value="dev">Dev</option>
                      <option value="client">Cliente</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      {item.responsible === 'dev' ? <Laptop className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5 text-accent" />}
                      <span className="text-sm text-gray-600 capitalize">{item.responsible}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {isEditMode ? (
                    <select 
                      value={item.status}
                      onChange={(e) => handleUpdate(item.id, { status: e.target.value as Deliverable['status'] })}
                      className="text-xs rounded border-gray-200"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in-progress">En progreso</option>
                      <option value="done">Hecho</option>
                      <option value="waiting-client">Esperando cliente</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-xs font-medium text-gray-700">
                        {item.status === 'done' ? 'Hecho' : 
                         item.status === 'in-progress' ? 'En progreso' : 
                         item.status === 'waiting-client' ? 'Esperando cliente' : 'Pendiente'}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {isEditMode ? (
                    <input 
                      type="date" 
                      value={format(new Date(item.dueDate), 'yyyy-MM-dd')}
                      onChange={(e) => handleUpdate(item.id, { dueDate: new Date(e.target.value).toISOString() })}
                      className="text-xs rounded border-gray-200"
                    />
                  ) : (
                    <span className="text-sm text-gray-500 font-medium">{format(new Date(item.dueDate), 'dd/MM/yy')}</span>
                  )}
                </td>
                {isEditMode && (
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProjectDeliverables;
