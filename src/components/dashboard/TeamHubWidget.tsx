import React, { useState } from 'react';
import {
  Users, Link2, Plus, X, ExternalLink, StickyNote,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { TeamResource, PinnedNote, ResourceIcon } from '../../types';

// ─── Resource icon map ────────────────────────────────────────────────────────

const RESOURCE_OPTIONS: { icon: ResourceIcon; label: string; color: string }[] = [
  { icon: 'figma',     label: 'Figma',        color: '#A259FF' },
  { icon: 'drive',     label: 'Google Drive',  color: '#0F9D58' },
  { icon: 'notion',    label: 'Notion',        color: '#374151' },
  { icon: 'github',    label: 'GitHub',        color: '#1f2937' },
  { icon: 'whatsapp',  label: 'WhatsApp',      color: '#25D366' },
  { icon: 'slack',     label: 'Slack',         color: '#4A154B' },
  { icon: 'linear',    label: 'Linear',        color: '#5B6AD0' },
  { icon: 'trello',    label: 'Trello',        color: '#0052CC' },
  { icon: 'canva',     label: 'Canva',         color: '#7D2AE8' },
  { icon: 'link',      label: 'Otro link',     color: '#6b7280' },
];

const NOTE_COLORS: { value: PinnedNote['color']; bg: string; border: string; dot: string }[] = [
  { value: 'yellow', bg: 'bg-amber-50',   border: 'border-amber-200', dot: 'bg-amber-400' },
  { value: 'blue',   bg: 'bg-blue-50',    border: 'border-blue-200',  dot: 'bg-blue-400'  },
  { value: 'green',  bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  { value: 'pink',   bg: 'bg-pink-50',    border: 'border-pink-200',  dot: 'bg-pink-400'  },
];

function ResourceIconEl({ icon, size = 16 }: { icon: ResourceIcon; size?: number }) {
  return <Link2 size={size} className="shrink-0" />;
}

// ─── Main component ───────────────────────────────────────────────────────────

const TeamHubWidget: React.FC = () => {
  const { settings, addTeamResource, removeTeamResource, addPinnedNote, removePinnedNote } =
    useSettingsStore();

  const [tab, setTab]             = useState<'resources' | 'notes' | 'team'>('resources');
  const [showAddRes, setShowAddRes] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  // Add resource form state
  const [resIcon, setResIcon]   = useState<ResourceIcon>('link');
  const [resLabel, setResLabel] = useState('');
  const [resUrl, setResUrl]     = useState('');

  // Add note form state
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor]     = useState<PinnedNote['color']>('yellow');

  const resources  = settings.teamResources  ?? [];
  const notes      = settings.pinnedNotes    ?? [];
  const members    = settings.teamMembers    ?? [];

  const handleAddResource = () => {
    if (!resLabel.trim() || !resUrl.trim()) return;
    const url = resUrl.startsWith('http') ? resUrl : `https://${resUrl}`;
    addTeamResource({
      id: `res-${Date.now()}`,
      label: resLabel.trim(),
      url,
      icon: resIcon,
    });
    setResLabel(''); setResUrl(''); setResIcon('link');
    setShowAddRes(false);
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    addPinnedNote({
      id: `note-${Date.now()}`,
      content: noteContent.trim(),
      author: settings.name || 'Yo',
      color: noteColor,
      createdAt: new Date().toISOString(),
    });
    setNoteContent('');
    setShowAddNote(false);
  };

  const selectedRes = RESOURCE_OPTIONS.find(o => o.icon === resIcon) ?? RESOURCE_OPTIONS[9];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-dark text-sm leading-tight">Team Hub</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {members.length > 0 ? `${members.length + 1} miembros` : 'Recursos y notas del equipo'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {([
          { key: 'resources' as const, label: 'Recursos', count: resources.length },
          { key: 'notes'     as const, label: 'Tablón',   count: notes.length     },
          { key: 'team'      as const, label: 'Equipo',   count: members.length   },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-colors border-b-2 ${
              tab === t.key
                ? 'border-violet-500 text-violet-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 space-y-3 min-h-[120px]">

        {/* ── Resources tab ── */}
        {tab === 'resources' && (
          <>
            {resources.length === 0 && !showAddRes && (
              <p className="text-xs text-gray-400 text-center py-4">
                Agregá links del equipo: Figma, Drive, Notion, GitHub…
              </p>
            )}

            <div className="space-y-2">
              {resources.map(r => {
                const opt = RESOURCE_OPTIONS.find(o => o.icon === r.icon) ?? RESOURCE_OPTIONS[9];
                return (
                  <div key={r.id} className="flex items-center gap-2.5 group">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: opt.color + '18' }}
                    >
                      <ResourceIconEl icon={r.icon} size={14} />
                    </div>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0 flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <span className="text-xs font-semibold text-dark truncate">{r.label}</span>
                      <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-primary shrink-0" />
                    </a>
                    <button
                      onClick={() => removeTeamResource(r.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-danger transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {showAddRes ? (
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={resIcon}
                    onChange={e => setResIcon(e.target.value as ResourceIcon)}
                    className="input text-xs py-2"
                  >
                    {RESOURCE_OPTIONS.map(o => (
                      <option key={o.icon} value={o.icon}>{o.label}</option>
                    ))}
                  </select>
                  <input
                    value={resLabel}
                    onChange={e => setResLabel(e.target.value)}
                    placeholder="Nombre"
                    className="input text-xs py-2"
                    autoFocus
                  />
                </div>
                <input
                  value={resUrl}
                  onChange={e => setResUrl(e.target.value)}
                  placeholder="https://..."
                  className="input text-xs py-2"
                  onKeyDown={e => e.key === 'Enter' && handleAddResource()}
                />
                <div className="flex gap-2">
                  <button onClick={handleAddResource} className="btn-primary text-xs py-1.5 px-3 flex-1">
                    Agregar
                  </button>
                  <button onClick={() => setShowAddRes(false)} className="btn-secondary text-xs py-1.5 px-3">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddRes(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors font-semibold py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar recurso
              </button>
            )}
          </>
        )}

        {/* ── Notes tab ── */}
        {tab === 'notes' && (
          <>
            {notes.length === 0 && !showAddNote && (
              <p className="text-xs text-gray-400 text-center py-4">
                Dejá notas importantes para el equipo: decisiones, recordatorios, avisos.
              </p>
            )}

            <div className="space-y-2">
              {notes.map(n => {
                const c = NOTE_COLORS.find(c => c.value === n.color) ?? NOTE_COLORS[0];
                return (
                  <div
                    key={n.id}
                    className={`${c.bg} border ${c.border} rounded-xl px-3 py-2.5 flex items-start gap-2 group`}
                  >
                    <div className={`w-2 h-2 rounded-full ${c.dot} shrink-0 mt-1`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{n.content}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.author} · {new Date(n.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <button
                      onClick={() => removePinnedNote(n.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-danger transition-all shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {showAddNote ? (
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <textarea
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Escribí una nota para el equipo…"
                  rows={2}
                  className="input text-xs py-2 resize-none"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setNoteColor(c.value)}
                      className={`w-5 h-5 rounded-full ${c.dot} transition-transform ${noteColor === c.value ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                    />
                  ))}
                  <div className="flex-1" />
                  <button onClick={handleAddNote} className="btn-primary text-xs py-1.5 px-3">
                    Fijar
                  </button>
                  <button onClick={() => setShowAddNote(false)} className="btn-secondary text-xs py-1.5 px-3">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddNote(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors font-semibold py-1"
              >
                <StickyNote className="w-3.5 h-3.5" />
                Nueva nota
              </button>
            )}
          </>
        )}

        {/* ── Team tab ── */}
        {tab === 'team' && (
          <>
            {members.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-gray-400">No hay miembros del equipo aún.</p>
                <a href="/settings" className="text-xs text-violet-600 font-semibold mt-1 inline-block hover:underline">
                  Agregar desde Configuración →
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Owner */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">
                      {(settings.name || 'Y').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dark truncate">{settings.name || 'Vos'}</p>
                    <p className="text-[10px] text-gray-400">Owner</p>
                  </div>
                </div>
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: m.color }}
                    >
                      <span className="text-white text-[10px] font-bold">
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-dark truncate">{m.name}</p>
                      <p className="text-[10px] text-gray-400">{m.role}</p>
                    </div>
                    {m.email && (
                      <a
                        href={`mailto:${m.email}`}
                        className="text-gray-300 hover:text-primary transition-colors"
                        title={m.email}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
                <a
                  href="/settings"
                  className="block text-center text-xs text-gray-400 hover:text-violet-600 transition-colors font-semibold pt-1"
                >
                  Gestionar equipo →
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeamHubWidget;
