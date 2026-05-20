import React, { useState } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import type { TeamMember } from '../../types';

// ─── Props ───────────────────────────────────────────────

interface TeamPanelProps {
  members: TeamMember[];
  ownerName: string;
  onAdd: (m: TeamMember) => void;
  onUpdate: (m: TeamMember) => void;
  onRemove: (id: string) => void;
}

// ─── Color palette ────────────────────────────────────────

const COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#D97706',
  '#DC2626', '#0891B2', '#7C2D12', '#4F46E5',
];

function pickColor(name: string): string {
  // Use name length + char codes for a stable but varied pick
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Inline member form ───────────────────────────────────

interface MemberFormData {
  name: string;
  email: string;
  role: string;
}

const EMPTY_FORM: MemberFormData = { name: '', email: '', role: '' };

interface MemberFormProps {
  initial?: MemberFormData;
  onSave: (data: MemberFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const MemberForm: React.FC<MemberFormProps> = ({ initial = EMPTY_FORM, onSave, onCancel, submitLabel = 'Agregar' }) => {
  const [form, setForm] = useState<MemberFormData>({ ...initial });

  const set = (key: keyof MemberFormData, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Nombre *</label>
          <input
            className="input"
            placeholder="Ej: Laura García"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Rol</label>
          <input
            className="input"
            placeholder="Ej: Diseñadora, Developer Senior"
            value={form.role}
            onChange={e => set('role', e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          Cancelar
        </button>
        <button type="submit" className="btn-primary text-sm">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

// ─── TeamPanel ────────────────────────────────────────────

const TeamPanel: React.FC<TeamPanelProps> = ({ members, ownerName, onAdd, onUpdate, onRemove }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = (data: MemberFormData) => {
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role.trim(),
      color: pickColor(data.name.trim()),
    };
    onAdd(newMember);
    setShowAddForm(false);
  };

  const handleUpdate = (member: TeamMember, data: MemberFormData) => {
    onUpdate({
      ...member,
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role.trim(),
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">Equipo de trabajo</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Los miembros del equipo pueden ser asignados a tareas y proyectos.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar miembro
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <MemberForm
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
          submitLabel="Agregar miembro"
        />
      )}

      {/* Members list */}
      <div className="space-y-2">
        {members.length === 0 && !showAddForm && (
          <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
            Todavía no hay miembros en el equipo.
          </div>
        )}

        {members.map((member, idx) => {
          const isOwner = idx === 0 && member.name === ownerName;
          const isEditing = editingId === member.id;

          return (
            <div key={member.id}>
              {isEditing ? (
                <MemberForm
                  initial={{ name: member.name, email: member.email, role: member.role }}
                  onSave={data => handleUpdate(member, data)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Guardar cambios"
                />
              ) : (
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 group hover:border-gray-200 hover:shadow-sm transition-all">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: member.color }}
                  >
                    {getInitials(member.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800 truncate">{member.name}</span>
                      {isOwner && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 shrink-0">
                          Vos
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      {member.role && <span className="font-medium text-gray-600">{member.role}</span>}
                      {member.email && (
                        <>
                          {member.role && <span className="text-gray-300">·</span>}
                          <span className="truncate">{member.email}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => { setEditingId(member.id); setShowAddForm(false); }}
                      className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {!isOwner && (
                      <button
                        onClick={() => onRemove(member.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamPanel;
