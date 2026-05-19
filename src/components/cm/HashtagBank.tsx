import React, { useState } from 'react';
import { Plus, X, Copy, Check, Hash, Edit2 } from 'lucide-react';
import type { CMHashtagGroup } from '../../types';

const PLATFORM_OPTIONS = ['', 'Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'YouTube', 'Pinterest', 'Twitter/X'];

interface HashtagBankProps {
  groups: CMHashtagGroup[];
  onAdd: (g: CMHashtagGroup) => void;
  onUpdate: (g: CMHashtagGroup) => void;
  onDelete: (id: string) => void;
}

const HashtagBank: React.FC<HashtagBankProps> = ({ groups, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', platform: '', raw: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reset = () => { setForm({ name: '', description: '', platform: '', raw: '' }); setEditId(null); setShowForm(false); };

  const startEdit = (g: CMHashtagGroup) => {
    setForm({ name: g.name, description: g.description, platform: g.platform ?? '', raw: g.hashtags.map(h => `#${h}`).join(' ') });
    setEditId(g.id);
    setShowForm(true);
  };

  const parseHashtags = (raw: string): string[] =>
    raw.split(/[\s,]+/)
      .map(h => h.replace(/^#+/, '').trim())
      .filter(Boolean);

  const handleSave = () => {
    if (!form.name.trim()) return;
    const hashtags = parseHashtags(form.raw);
    const payload: CMHashtagGroup = {
      id: editId ?? crypto.randomUUID(),
      name: form.name.trim(),
      description: form.description.trim(),
      platform: form.platform || undefined,
      hashtags,
    };
    if (editId) onUpdate(payload);
    else onAdd(payload);
    reset();
  };

  const copyGroup = (g: CMHashtagGroup) => {
    const text = g.hashtags.map(h => `#${h}`).join(' ');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(g.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Banco de Hashtags</h3>
        <button
          onClick={() => { reset(); setShowForm(v => !v); }}
          className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo grupo
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
          <h4 className="font-bold text-dark text-sm">{editId ? 'Editar grupo' : 'Nuevo grupo de hashtags'}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre del grupo *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" placeholder="Ej: Engagement general" />
            </div>
            <div>
              <label className="label">Plataforma</label>
              <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} className="input">
                {PLATFORM_OPTIONS.map(o => <option key={o} value={o}>{o || 'Todas'}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Descripción</label>
              <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input" placeholder="Ej: Para posts de lifestyle y motivación" />
            </div>
            <div className="col-span-2">
              <label className="label">
                Hashtags <span className="text-gray-400 font-normal normal-case">(separados por espacio o coma)</span>
              </label>
              <textarea
                value={form.raw}
                onChange={e => setForm(p => ({ ...p, raw: e.target.value }))}
                rows={3}
                className="input resize-none font-mono text-xs"
                placeholder="#hashtag1 #hashtag2 #hashtag3..."
              />
              <p className="text-[10px] text-gray-400 mt-1">
                {parseHashtags(form.raw).length} hashtags
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={reset} className="btn-secondary text-sm">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="btn-primary text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> {editId ? 'Guardar' : 'Crear grupo'}
            </button>
          </div>
        </div>
      )}

      {/* Groups */}
      {groups.length === 0 && !showForm ? (
        <div className="text-center py-10 text-gray-400">
          <Hash className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay grupos de hashtags todavía.</p>
          <p className="text-xs mt-1">Guardá tus hashtags por categoría y copialos con 1 click.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groups.map(g => {
            const isCopied = copiedId === g.id;
            return (
              <div key={g.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-dark text-sm">{g.name}</h4>
                      {g.platform && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
                          {g.platform}
                        </span>
                      )}
                    </div>
                    {g.description && <p className="text-xs text-gray-400 mt-0.5">{g.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => copyGroup(g)}
                      className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                        isCopied
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'
                      }`}
                      title="Copiar todos los hashtags"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => startEdit(g)} className="p-1.5 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors opacity-0 group-hover:opacity-100">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(g.id)} className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-danger-light transition-colors opacity-0 group-hover:opacity-100">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {g.hashtags.slice(0, 12).map(h => (
                    <span key={h} className="text-[11px] font-medium px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-gray-600">
                      #{h}
                    </span>
                  ))}
                  {g.hashtags.length > 12 && (
                    <span className="text-[11px] text-gray-400 font-medium px-2 py-0.5">
                      +{g.hashtags.length - 12} más
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">{g.hashtags.length} hashtags</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HashtagBank;
