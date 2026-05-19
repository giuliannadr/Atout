import React, { useState } from 'react';
import { Plus, X, Target, DollarSign, Calendar, Edit2, Check } from 'lucide-react';
import type { CMCampaign } from '../../types';

const CAMPAIGN_PLATFORMS = ['Meta', 'Google', 'TikTok', 'LinkedIn', 'Pinterest', 'Twitter/X', 'Otro'];
const OBJECTIVES = ['Reconocimiento', 'Alcance', 'Tráfico', 'Interacción', 'Leads', 'Ventas', 'Otro'];

const STATUS_CFG = {
  draft:    { label: 'Borrador',  className: 'bg-gray-100 text-gray-500' },
  active:   { label: 'Activa',    className: 'bg-emerald-100 text-emerald-700' },
  paused:   { label: 'Pausada',   className: 'bg-amber-100 text-amber-700' },
  finished: { label: 'Finalizada',className: 'bg-blue-100 text-blue-700' },
} as const;

const PLATFORM_STYLE: Record<string, string> = {
  Meta: 'bg-blue-100 text-blue-700',
  Google: 'bg-red-100 text-red-700',
  TikTok: 'bg-gray-900 text-white',
  LinkedIn: 'bg-blue-700 text-white',
  Pinterest: 'bg-rose-100 text-rose-700',
  'Twitter/X': 'bg-sky-100 text-sky-700',
  default: 'bg-gray-100 text-gray-600',
};

const EMPTY: Omit<CMCampaign, 'id'> = {
  name: '',
  platform: 'Meta',
  objective: 'Reconocimiento',
  budget: 0,
  currency: 'USD',
  startDate: '',
  endDate: '',
  reviewDate: '',
  status: 'draft',
  notes: '',
};

interface CampaignTrackerProps {
  campaigns: CMCampaign[];
  defaultCurrency?: string;
  onAdd: (c: CMCampaign) => void;
  onUpdate: (c: CMCampaign) => void;
  onDelete: (id: string) => void;
}

const CampaignTracker: React.FC<CampaignTrackerProps> = ({
  campaigns,
  defaultCurrency = 'USD',
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CMCampaign, 'id'>>({ ...EMPTY, currency: defaultCurrency as CMCampaign['currency'] });

  const reset = () => { setForm({ ...EMPTY, currency: defaultCurrency as CMCampaign['currency'] }); setEditId(null); setShowForm(false); };

  const startEdit = (c: CMCampaign) => {
    setForm({ name: c.name, platform: c.platform, objective: c.objective, budget: c.budget, currency: c.currency, startDate: c.startDate, endDate: c.endDate, reviewDate: c.reviewDate ?? '', status: c.status, notes: c.notes, reach: c.reach, clicks: c.clicks, conversions: c.conversions, spend: c.spend });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.startDate || !form.endDate) return;
    if (editId) onUpdate({ ...form, id: editId });
    else onAdd({ ...form, id: crypto.randomUUID() });
    reset();
  };

  const totalBudget = campaigns.reduce((s, c) => s + (c.budget ?? 0), 0);
  const totalSpend = campaigns.reduce((s, c) => s + (c.spend ?? 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const f = (n: number, cur: string) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4">
      {/* Summary row */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Activas', value: activeCampaigns, sub: `de ${campaigns.length}`, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Budget total', value: f(totalBudget, campaigns[0]?.currency ?? defaultCurrency), sub: 'presupuestado', color: 'bg-blue-100 text-blue-600' },
            { label: 'Gastado', value: f(totalSpend, campaigns[0]?.currency ?? defaultCurrency), sub: 'ejecutado', color: 'bg-amber-100 text-amber-600' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-3 ${s.color.split(' ')[0]}`}>
              <p className={`text-lg font-black ${s.color.split(' ')[1]}`}>{s.value}</p>
              <p className="text-xs font-bold text-gray-500">{s.label}</p>
              <p className="text-[10px] text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Campañas</h3>
        <button
          onClick={() => { reset(); setShowForm(v => !v); }}
          className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nueva campaña
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-100">
          <h4 className="font-bold text-dark text-sm">{editId ? 'Editar campaña' : 'Nueva campaña'}</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" placeholder="Ej: Lanzamiento temporada verano" />
            </div>
            <div>
              <label className="label">Plataforma</label>
              <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} className="input">
                {CAMPAIGN_PLATFORMS.map(pl => <option key={pl} value={pl}>{pl}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Objetivo</label>
              <select value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))} className="input">
                {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Budget</label>
              <input type="number" min={0} value={form.budget} onChange={e => setForm(p => ({ ...p, budget: Number(e.target.value) }))} className="input" />
            </div>
            <div>
              <label className="label">Moneda</label>
              <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value as CMCampaign['currency'] }))} className="input">
                {['USD', 'ARS', 'MXN', 'CLP'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1"><Calendar className="w-3 h-3" /> Inicio *</label>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Calendar className="w-3 h-3" /> Fin *</label>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Fecha de revisión</label>
              <input type="date" value={form.reviewDate} onChange={e => setForm(p => ({ ...p, reviewDate: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Estado</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as CMCampaign['status'] }))} className="input">
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Notas</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="input resize-none" placeholder="Observaciones, audiencia, creatividades..." />
            </div>

            {/* Results section */}
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Resultados (post-campaña)</p>
              <div className="grid grid-cols-4 gap-2">
                {([['reach', 'Alcance'], ['clicks', 'Clicks'], ['conversions', 'Conversiones'], ['spend', 'Gasto real']] as const).map(([k, l]) => (
                  <div key={k}>
                    <label className="label">{l}</label>
                    <input type="number" min={0} value={(form as any)[k] ?? ''} onChange={e => setForm(p => ({ ...p, [k]: Number(e.target.value) || undefined }))} className="input" placeholder="0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={reset} className="btn-secondary text-sm">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.startDate || !form.endDate}
              className="btn-primary text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> {editId ? 'Guardar' : 'Crear campaña'}
            </button>
          </div>
        </div>
      )}

      {/* Campaign list */}
      {campaigns.length === 0 && !showForm ? (
        <div className="text-center py-10 text-gray-400">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay campañas todavía.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map(c => {
            const statusCfg = STATUS_CFG[c.status] ?? STATUS_CFG.draft;
            const platformStyle = PLATFORM_STYLE[c.platform] ?? PLATFORM_STYLE.default;
            const pct = c.budget > 0 && c.spend ? Math.round((c.spend / c.budget) * 100) : null;

            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${platformStyle}`}>{c.platform}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.className}`}>{statusCfg.label}</span>
                      <span className="text-[10px] text-gray-400">{c.objective}</span>
                    </div>
                    <h4 className="font-bold text-dark text-sm truncate">{c.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{f(c.budget, c.currency)}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.startDate} → {c.endDate}</span>
                    </div>
                    {pct !== null && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                          <span>Presupuesto ejecutado</span><span>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct > 90 ? 'bg-danger' : pct > 70 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => startEdit(c)} className="p-1.5 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(c.id)} className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-danger-light transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignTracker;
