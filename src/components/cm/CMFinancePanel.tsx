import React, { useState } from 'react';
import { Plus, X, DollarSign, Check, Edit2, AlertCircle } from 'lucide-react';
import type { CMMonthlyFee } from '../../types';

const MONTHS_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function monthLabel(m: string) {
  const [y, mo] = m.split('-');
  return `${MONTHS_LABELS[parseInt(mo, 10) - 1]} ${y}`;
}

const STATUS_CFG = {
  pending:  { label: 'Pendiente', className: 'bg-amber-100 text-amber-700', icon: <AlertCircle className="w-3 h-3" /> },
  invoiced: { label: 'Facturado', className: 'bg-blue-100 text-blue-700',   icon: <DollarSign className="w-3 h-3" /> },
  paid:     { label: 'Cobrado',   className: 'bg-emerald-100 text-emerald-700', icon: <Check className="w-3 h-3" /> },
} as const;

const EMPTY_FORM = {
  month: new Date().toISOString().slice(0, 7),
  amount: 0,
  currency: 'USD' as CMMonthlyFee['currency'],
  status: 'pending' as CMMonthlyFee['status'],
  invoiceDate: '',
  paymentDate: '',
  notes: '',
};

interface CMFinancePanelProps {
  fees: CMMonthlyFee[];
  defaultCurrency?: string;
  clientName?: string;
  onAdd: (f: CMMonthlyFee) => void;
  onUpdate: (f: CMMonthlyFee) => void;
  onDelete: (id: string) => void;
}

const CMFinancePanel: React.FC<CMFinancePanelProps> = ({
  fees,
  defaultCurrency = 'USD',
  clientName,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, currency: defaultCurrency as CMMonthlyFee['currency'] });

  const reset = () => { setForm({ ...EMPTY_FORM, currency: defaultCurrency as CMMonthlyFee['currency'] }); setEditId(null); setShowForm(false); };

  const startEdit = (f: CMMonthlyFee) => {
    setForm({ month: f.month, amount: f.amount, currency: f.currency, status: f.status, invoiceDate: f.invoiceDate ?? '', paymentDate: f.paymentDate ?? '', notes: f.notes });
    setEditId(f.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.month || form.amount <= 0) return;
    const payload: CMMonthlyFee = {
      id: editId ?? crypto.randomUUID(),
      month: form.month,
      amount: form.amount,
      currency: form.currency,
      status: form.status,
      invoiceDate: form.invoiceDate || undefined,
      paymentDate: form.paymentDate || undefined,
      notes: form.notes,
    };
    if (editId) onUpdate(payload);
    else onAdd(payload);
    reset();
  };

  const quickStatus = (fee: CMMonthlyFee, newStatus: CMMonthlyFee['status']) => {
    onUpdate({ ...fee, status: newStatus });
  };

  const sorted = [...fees].sort((a, b) => b.month.localeCompare(a.month));
  const cur = fees[0]?.currency ?? defaultCurrency;
  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(n);

  const totalBilled = fees.filter(fee => fee.status !== 'pending').reduce((s, fee) => s + fee.amount, 0);
  const totalPaid = fees.filter(fee => fee.status === 'paid').reduce((s, fee) => s + fee.amount, 0);
  const totalPending = fees.filter(fee => fee.status === 'pending').reduce((s, fee) => s + fee.amount, 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      {fees.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total facturado', value: fmt(totalBilled), color: 'bg-blue-50 text-blue-700' },
            { label: 'Cobrado', value: fmt(totalPaid), color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Pendiente', value: fmt(totalPending), color: 'bg-amber-50 text-amber-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-3 ${s.color.split(' ')[0]}`}>
              <p className={`text-lg font-black ${s.color.split(' ')[1]}`}>{s.value}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
          Honorarios {clientName ? `— ${clientName}` : ''}
        </h3>
        <button
          onClick={() => { reset(); setShowForm(v => !v); }}
          className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo mes
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
          <h4 className="font-bold text-dark text-sm">{editId ? 'Editar honorario' : 'Registrar honorario'}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Mes *</label>
              <input type="month" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Estado</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as CMMonthlyFee['status'] }))} className="input">
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Monto *</label>
              <input type="number" min={0} value={form.amount} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} className="input" />
            </div>
            <div>
              <label className="label">Moneda</label>
              <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value as CMMonthlyFee['currency'] }))} className="input">
                {['USD', 'ARS', 'MXN', 'CLP'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Fecha de factura</label>
              <input type="date" value={form.invoiceDate} onChange={e => setForm(p => ({ ...p, invoiceDate: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Fecha de cobro</label>
              <input type="date" value={form.paymentDate} onChange={e => setForm(p => ({ ...p, paymentDate: e.target.value }))} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Notas</label>
              <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="input" placeholder="Ej: Incluye gestión de 3 redes + reportes" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={reset} className="btn-secondary text-sm">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={!form.month || form.amount <= 0}
              className="btn-primary text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> {editId ? 'Guardar' : 'Registrar'}
            </button>
          </div>
        </div>
      )}

      {/* Fee list */}
      {sorted.length === 0 && !showForm ? (
        <div className="text-center py-10 text-gray-400">
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay honorarios registrados todavía.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(fee => {
            const statusCfg = STATUS_CFG[fee.status] ?? STATUS_CFG.pending;
            const nextStatus: CMMonthlyFee['status'] = fee.status === 'pending' ? 'invoiced' : 'paid';
            return (
              <div key={fee.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow group">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusCfg.className}`}>
                        {statusCfg.icon}{statusCfg.label}
                      </span>
                      <span className="text-xs text-gray-400">{monthLabel(fee.month)}</span>
                    </div>
                    <p className="font-black text-dark text-lg">{fmt(fee.amount)}</p>
                    {fee.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{fee.notes}</p>}
                    {fee.paymentDate && (
                      <p className="text-[10px] text-emerald-600 mt-0.5">Cobrado el {fee.paymentDate}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {fee.status !== 'paid' && (
                      <button
                        onClick={() => quickStatus(fee, nextStatus)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors whitespace-nowrap"
                      >
                        → {STATUS_CFG[nextStatus].label}
                      </button>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(fee)} className="p-1.5 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(fee.id)} className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-danger-light transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

export default CMFinancePanel;
