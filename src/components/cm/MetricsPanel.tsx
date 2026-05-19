import React, { useState } from 'react';
import { Plus, X, TrendingUp, TrendingDown, Users, Eye, Heart, Edit2, Check, RefreshCw, Wifi } from 'lucide-react';
import type { CMMetrics, CMMetaConnection } from '../../types';

const PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'YouTube', 'Pinterest', 'Twitter/X'];

const MONTHS_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

function monthLabel(m: string) {
  const [y, mo] = m.split('-');
  return `${MONTHS_LABELS[parseInt(mo, 10) - 1]} ${y.slice(2)}`;
}

const EMPTY_FORM = {
  month: new Date().toISOString().slice(0, 7),
  platform: 'Instagram',
  followers: 0,
  followersGrowth: 0,
  reach: 0,
  impressions: 0,
  engagementRate: 0,
};

interface MiniBarProps {
  value: number;
  max: number;
  color: string;
}
const MiniBar: React.FC<MiniBarProps> = ({ value, max, color }) => (
  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden w-full">
    <div className={`h-full rounded-full ${color}`} style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%` }} />
  </div>
);

interface MetricsPanelProps {
  metrics: CMMetrics[];
  metaConnection?: CMMetaConnection;
  onAdd: (m: CMMetrics) => void;
  onUpdate: (m: CMMetrics) => void;
  onDelete: (id: string) => void;
  onSyncMeta?: () => Promise<void>;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({
  metrics, metaConnection, onAdd, onUpdate, onDelete, onSyncMeta,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [filterPlatform, setFilterPlatform] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSync = async () => {
    if (!onSyncMeta) return;
    setSyncing(true);
    setSyncError(null);
    try {
      await onSyncMeta();
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Error al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const isConnected = !!(metaConnection?.accessToken && metaConnection?.instagramAccountId);

  const reset = () => { setForm({ ...EMPTY_FORM }); setEditId(null); setShowForm(false); };

  const startEdit = (m: CMMetrics) => {
    setForm({ month: m.month, platform: m.platform, followers: m.followers, followersGrowth: m.followersGrowth, reach: m.reach, impressions: m.impressions, engagementRate: m.engagementRate });
    setEditId(m.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.month || !form.platform) return;
    const payload: CMMetrics = { ...form, id: editId ?? crypto.randomUUID() };
    if (editId) onUpdate(payload);
    else onAdd(payload);
    reset();
  };

  const filtered = metrics.filter(m => !filterPlatform || m.platform === filterPlatform)
    .sort((a, b) => b.month.localeCompare(a.month));

  const platforms = [...new Set(metrics.map(m => m.platform))];

  // Latest metrics per platform for summary
  const latestByPlatform = platforms.map(pl => {
    const sorted = metrics.filter(m => m.platform === pl).sort((a, b) => b.month.localeCompare(a.month));
    return sorted[0] ?? null;
  }).filter(Boolean) as CMMetrics[];

  const maxFollowers = Math.max(...latestByPlatform.map(m => m.followers), 1);
  const maxReach = Math.max(...filtered.map(m => m.reach), 1);

  return (
    <div className="space-y-5">
      {/* Platform summary cards */}
      {latestByPlatform.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {latestByPlatform.map(m => (
            <div key={m.platform} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600">{m.platform}</span>
                <span className="text-[10px] text-gray-400">{monthLabel(m.month)}</span>
              </div>
              <p className="text-xl font-black text-dark">{m.followers.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {m.followersGrowth >= 0
                  ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                  : <TrendingDown className="w-3 h-3 text-danger" />}
                <span className={`text-xs font-bold ${m.followersGrowth >= 0 ? 'text-emerald-600' : 'text-danger'}`}>
                  {m.followersGrowth >= 0 ? '+' : ''}{m.followersGrowth.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400">seguidores</span>
              </div>
              <MiniBar value={m.followers} max={maxFollowers} color="bg-violet-400" />
              <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                <span>{m.engagementRate.toFixed(2)}% eng.</span>
                <span>{m.reach.toLocaleString()} alcance</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Historial</h3>
          {platforms.length > 0 && (
            <select
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
              className="input py-1 text-xs"
              style={{ width: 'auto' }}
            >
              <option value="">Todas</option>
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {syncing
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <Wifi className="w-3.5 h-3.5" />}
              {syncing ? 'Sincronizando…' : 'Sincronizar Meta'}
            </button>
          )}
          <button
            onClick={() => { reset(); setShowForm(v => !v); }}
            className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Cargar métricas
          </button>
        </div>
      </div>

      {syncError && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>⚠ {syncError}</span>
          <button onClick={() => setSyncError(null)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {metaConnection?.lastSyncedAt && (
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-500" />
          Última sync: {new Date(metaConnection.lastSyncedAt).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-100">
          <h4 className="font-bold text-dark text-sm">{editId ? 'Editar métricas' : 'Cargar métricas del mes'}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Mes *</label>
              <input type="month" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Plataforma *</label>
              <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} className="input">
                {PLATFORMS.map(pl => <option key={pl} value={pl}>{pl}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'followers', label: 'Seguidores', icon: <Users className="w-3 h-3" /> },
              { key: 'followersGrowth', label: 'Crecimiento (±)', icon: <TrendingUp className="w-3 h-3" /> },
              { key: 'reach', label: 'Alcance', icon: <Eye className="w-3 h-3" /> },
              { key: 'impressions', label: 'Impresiones', icon: <Eye className="w-3 h-3" /> },
              { key: 'engagementRate', label: 'Engagement %', icon: <Heart className="w-3 h-3" /> },
            ].map(({ key, label, icon }) => (
              <div key={key}>
                <label className="label flex items-center gap-1">{icon} {label}</label>
                <input
                  type="number"
                  step={key === 'engagementRate' ? 0.01 : 1}
                  value={(form as any)[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                  className="input"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={reset} className="btn-secondary text-sm">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={!form.month || !form.platform}
              className="btn-primary text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> {editId ? 'Guardar' : 'Cargar'}
            </button>
          </div>
        </div>
      )}

      {/* History table */}
      {filtered.length === 0 && !showForm ? (
        <div className="text-center py-10 text-gray-400">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay métricas cargadas todavía.</p>
          <p className="text-xs mt-1">Cargá los datos mensuales de cada plataforma.</p>
        </div>
      ) : filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Mes', 'Plataforma', 'Seguidores', 'Crecimiento', 'Alcance', 'Eng. %', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-4 py-3 font-medium text-dark">{monthLabel(m.month)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">{m.platform}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-dark">{m.followers.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs font-bold ${m.followersGrowth >= 0 ? 'text-emerald-600' : 'text-danger'}`}>
                      {m.followersGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {m.followersGrowth >= 0 ? '+' : ''}{m.followersGrowth.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.reach.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{m.engagementRate.toFixed(2)}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(m)} className="p-1 text-gray-400 hover:text-violet-600 rounded transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => onDelete(m.id)} className="p-1 text-gray-400 hover:text-danger rounded transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MetricsPanel;
