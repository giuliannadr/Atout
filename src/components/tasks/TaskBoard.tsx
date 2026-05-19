import React, { useState } from 'react';
import { Plus, ChevronRight, X, Calendar, AlertCircle, User, Check } from 'lucide-react';
import type { Task, TeamMember, TaskStatus, PostPriority } from '../../types';

// ─── Constants ───────────────────────────────────────────

const COLUMNS: { key: TaskStatus; label: string; color: string; bg: string; dot: string; headerColor: string }[] = [
  { key: 'todo',        label: 'Por hacer',   color: 'text-gray-600',   bg: 'bg-gray-50',    dot: 'bg-gray-400',    headerColor: 'text-gray-500'  },
  { key: 'in_progress', label: 'En progreso', color: 'text-blue-600',   bg: 'bg-blue-50',    dot: 'bg-blue-500',    headerColor: 'text-blue-500'  },
  { key: 'review',      label: 'Revisión',    color: 'text-amber-600',  bg: 'bg-amber-50',   dot: 'bg-amber-400',   headerColor: 'text-amber-500' },
  { key: 'done',        label: 'Listo',       color: 'text-emerald-600',bg: 'bg-emerald-50', dot: 'bg-emerald-500', headerColor: 'text-emerald-600'},
];

const PRIORITY_CONFIG: Record<PostPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgente',  color: 'text-red-700',    bg: 'bg-red-100'    },
  high:   { label: 'Alta',     color: 'text-orange-700', bg: 'bg-orange-100' },
  normal: { label: 'Normal',   color: 'text-blue-700',   bg: 'bg-blue-100'   },
  low:    { label: 'Baja',     color: 'text-gray-600',   bg: 'bg-gray-100'   },
};

// ─── Props ───────────────────────────────────────────────

interface TaskBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onAdd: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

// ─── TaskForm (inline modal) ─────────────────────────────

interface TaskFormProps {
  task?: Task;
  defaultStatus?: TaskStatus;
  teamMembers: TeamMember[];
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const emptyTask = (status: TaskStatus = 'todo'): Omit<Task, 'id' | 'createdAt'> => ({
  title: '',
  description: '',
  status,
  priority: 'normal',
  assignedTo: [],
  dueDate: '',
  isInternal: false,
  subtasks: [],
});

const TaskForm: React.FC<TaskFormProps> = ({ task, defaultStatus = 'todo', teamMembers, onSave, onCancel }) => {
  const isEdit = !!task;
  const [form, setForm] = useState<Omit<Task, 'id' | 'createdAt'>>(() =>
    task
      ? {
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo ?? [],
          dueDate: task.dueDate ?? '',
          isInternal: task.isInternal ?? false,
          subtasks: task.subtasks ? task.subtasks.map(s => ({ ...s })) : [],
          tags: task.tags,
        }
      : emptyTask(defaultStatus)
  );
  const [newSubtask, setNewSubtask] = useState('');

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleAssignee = (id: string) => {
    set('assignedTo', form.assignedTo?.includes(id)
      ? form.assignedTo.filter(x => x !== id)
      : [...(form.assignedTo ?? []), id]);
  };

  const addSubtask = () => {
    const title = newSubtask.trim();
    if (!title) return;
    set('subtasks', [...(form.subtasks ?? []), { id: crypto.randomUUID(), title, done: false }]);
    setNewSubtask('');
  };

  const removeSubtask = (id: string) =>
    set('subtasks', (form.subtasks ?? []).filter(s => s.id !== id));

  const toggleSubtask = (id: string) =>
    set('subtasks', (form.subtasks ?? []).map(s => s.id === id ? { ...s, done: !s.done } : s));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: task?.id ?? crypto.randomUUID(),
      createdAt: task?.createdAt ?? now,
      ...form,
      title: form.title.trim(),
    });
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="label">Título *</label>
            <input
              className="input"
              placeholder="Nombre de la tarea"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Detalles de la tarea..."
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value as TaskStatus)}>
                {COLUMNS.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Prioridad</label>
              <select className="input" value={form.priority} onChange={e => set('priority', e.target.value as PostPriority)}>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="normal">Normal</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="label">Fecha límite</label>
            <input
              type="date"
              className="input"
              value={form.dueDate ?? ''}
              onChange={e => set('dueDate', e.target.value)}
            />
          </div>

          {/* Assignees */}
          {teamMembers.length > 0 && (
            <div>
              <label className="label">Asignar a</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {teamMembers.map(m => {
                  const selected = form.assignedTo?.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleAssignee(m.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                        selected
                          ? 'border-violet-400 bg-violet-50 text-violet-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: m.color }}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                      {m.name.split(' ')[0]}
                      {selected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Internal checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isInternal ?? false}
              onChange={e => set('isInternal', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-600">Solo interno (el cliente no lo ve)</span>
          </label>

          {/* Subtasks */}
          <div>
            <label className="label">Subtareas</label>
            <div className="space-y-1.5 mb-2">
              {(form.subtasks ?? []).map(sub => (
                <div key={sub.id} className="flex items-center gap-2 group">
                  <button
                    type="button"
                    onClick={() => toggleSubtask(sub.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      sub.done ? 'bg-violet-600 border-violet-600' : 'border-gray-300'
                    }`}
                  >
                    {sub.done && <Check className="w-2.5 h-2.5 text-white" />}
                  </button>
                  <span className={`flex-1 text-sm ${sub.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(sub.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1 py-1.5 text-sm"
                placeholder="Agregar subtarea..."
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
              />
              <button
                type="button"
                onClick={addSubtask}
                className="btn-secondary text-sm px-3 py-1.5"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            className="btn-primary"
          >
            {isEdit ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TaskCard ─────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  teamMembers: TeamMember[];
  allColumns: typeof COLUMNS;
  currentColKey: TaskStatus;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (newStatus: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, teamMembers, allColumns, currentColKey, onEdit, onDelete, onMove }) => {
  const priority = PRIORITY_CONFIG[task.priority];
  const assignees = (task.assignedTo ?? [])
    .map(id => teamMembers.find(m => m.id === id))
    .filter(Boolean) as TeamMember[];

  const subtasks = task.subtasks ?? [];
  const doneSubs = subtasks.filter(s => s.done).length;
  const subtaskPct = subtasks.length > 0 ? Math.round((doneSubs / subtasks.length) * 100) : 0;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
      {/* Top row: priority + delete */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priority.bg} ${priority.color}`}>
          {priority.label}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.isInternal && (
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Interno</span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <p
        className="text-sm font-semibold text-gray-800 leading-snug mb-2 hover:text-violet-700 transition-colors"
        onClick={onEdit}
      >
        {task.title}
      </p>

      {/* Subtask progress bar */}
      {subtasks.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
            <span>Subtareas</span>
            <span>{doneSubs}/{subtasks.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-violet-500 h-1.5 rounded-full transition-all"
              style={{ width: `${subtaskPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer row: assignees + due date */}
      <div className="flex items-center justify-between mt-2">
        {/* Assignee avatars */}
        <div className="flex items-center -space-x-1.5">
          {assignees.slice(0, 3).map(m => (
            <span
              key={m.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white ring-0"
              style={{ backgroundColor: m.color }}
              title={m.name}
            >
              {m.name.charAt(0).toUpperCase()}
            </span>
          ))}
          {assignees.length === 0 && (
            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-3 h-3 text-gray-400" />
            </span>
          )}
          {assignees.length > 3 && (
            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 border-2 border-white">
              +{assignees.length - 3}
            </span>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
            {isOverdue && <AlertCircle className="w-3 h-3" />}
            <Calendar className="w-3 h-3" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Move buttons (hover) */}
      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
        {allColumns
          .filter(c => c.key !== currentColKey)
          .map(target => (
            <button
              key={target.key}
              onClick={e => { e.stopPropagation(); onMove(target.key); }}
              className={`flex-1 text-[10px] font-bold py-1 rounded-lg flex items-center justify-center gap-0.5 transition-colors ${
                target.key === 'done'
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  : target.key === 'in_progress'
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  : target.key === 'review'
                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <ChevronRight className="w-2.5 h-2.5" />
              {target.label}
            </button>
          ))}
      </div>
    </div>
  );
};

// ─── TaskBoard ────────────────────────────────────────────

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, teamMembers, onAdd, onUpdate, onDelete }) => {
  const [formState, setFormState] = useState<{
    open: boolean;
    task?: Task;
    defaultStatus?: TaskStatus;
  }>({ open: false });

  const byStatus = (status: TaskStatus) =>
    tasks.filter(t => t.status === status);

  const handleSave = (task: Task) => {
    if (formState.task) {
      onUpdate(task);
    } else {
      onAdd(task);
    }
    setFormState({ open: false });
  };

  const handleMove = (task: Task, newStatus: TaskStatus) => {
    onUpdate({ ...task, status: newStatus });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colTasks = byStatus(col.key);
          return (
            <div key={col.key} className={`rounded-2xl ${col.bg} p-4 min-w-0`}>
              {/* Column header */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <span className={`text-sm font-bold ${col.headerColor}`}>{col.label}</span>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white ${col.color}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task cards */}
              <div className="space-y-2 min-h-[80px]">
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    teamMembers={teamMembers}
                    allColumns={COLUMNS}
                    currentColKey={col.key}
                    onEdit={() => setFormState({ open: true, task })}
                    onDelete={() => onDelete(task.id)}
                    onMove={newStatus => handleMove(task, newStatus)}
                  />
                ))}

                {/* Add button */}
                <button
                  onClick={() => setFormState({ open: true, defaultStatus: col.key })}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task form modal */}
      {formState.open && (
        <TaskForm
          task={formState.task}
          defaultStatus={formState.defaultStatus}
          teamMembers={teamMembers}
          onSave={handleSave}
          onCancel={() => setFormState({ open: false })}
        />
      )}
    </div>
  );
};

export default TaskBoard;
