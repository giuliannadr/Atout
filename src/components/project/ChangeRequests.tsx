import React, { useState } from 'react';
import {
  GitPullRequest, Plus, Clock, CheckCircle2, XCircle,
  AlertTriangle, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import type { ChangeRequest, ChangeRequestPriority, ChangeRequestStatus } from '../../types';
import { useProjectStore } from '../../store/projectStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<ChangeRequestPriority, { label: string; color: string; bg: string }> = {
  low:      { label: 'Baja',     color: 'text-gray-500',   bg: 'bg-gray-100'   },
  medium:   { label: 'Media',    color: 'text-amber-700',  bg: 'bg-amber-100'  },
  high:     { label: 'Alta',     color: 'text-orange-700', bg: 'bg-orange-100' },
  critical: { label: 'Crítica',  color: 'text-red-700',    bg: 'bg-red-100'    },
};

const STATUS_CONFIG: Record<ChangeRequestStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending:   { label: 'Pendiente',   icon: <Clock className="w-3.5 h-3.5" />,         color: 'text-gray-500'   },
  reviewing: { label: 'En revisión', icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, color: 'text-amber-600'  },
  approved:  { label: 'Aprobado',    icon: <CheckCircle2 className="w-3.5 h-3.5" />,  color: 'text-emerald-600'},
  rejected:  { label: 'Rechazado',   icon: <XCircle className="w-3.5 h-3.5" />,       color: 'text-red-500'    },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChangeRequestsProps {
  projectId: string;
  changeRequests: ChangeRequest[];
  currency: string;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const ChangeRequests: React.FC<ChangeRequestsProps> = ({ projectId, changeRequests, currency }) => {
  const { updateProject } = useProjectStore();

  const [showForm, setShowForm]       = useState(false);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ChangeRequestStatus | 'all'>('all');

  // Form state
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [priority, setPriority]     = useState<ChangeRequestPriority>('medium');
  const [hours, setHours]           = useState('');
  const [cost, setCost]             = useState('');

  // Review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote]   = useState('');

  const sym = { USD: 'U$D', ARS: '$', MXN: '$', CLP: '$' }[currency] ?? '$';

  const filtered = filterStatus === 'all'
    ? changeRequests
    : changeRequests.filter(c => c.status === filterStatus);

  const pending = changeRequests.filter(c => c.status === 'pending' || c.status === 'reviewing').length;

  const save = (updated: ChangeRequest[]) => {
    updateProject(projectId, { changeRequests: updated });
  };

  const handleAdd = () => {
    if (!title.trim() || !requestedBy.trim()) return;
    const newReq: ChangeRequest = {
      id: `cr-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      requestedBy: requestedBy.trim(),
      priority,
      estimatedHours: hours ? Number(hours) : undefined,
      extraCost: cost ? Number(cost) : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    save([...changeRequests, newReq]);
    setTitle(''); setDescription(''); setRequestedBy('');
    setPriority('medium'); setHours(''); setCost('');
    setShowForm(false);
  };

  const setStatus = (id: string, status: ChangeRequestStatus, note?: string) => {
    save(changeRequests.map(c =>
      c.id === id
        ? { ...c, status, statusNote: note, resolvedAt: ['approved','rejected'].includes(status) ? new Date().toISOString() : undefined }
        : c
    ));
    setReviewingId(null);
    setReviewNote('');
  };

  const remove = (id: string) => {
    save(changeRequests.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
            <GitPullRequest className="w-4.5 h-4.5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-dark text-sm">Solicitudes de Cambio</h3>
            <p className="text-xs text-gray-400">
              {pending > 0 ? `${pending} pendientes de revisión` : 'Control de scope creep'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn-primary text-xs py-2 px-3 gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva solicitud
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Nueva solicitud de cambio</p>

          <div className="grid grid-cols-2 gap-3">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título del cambio *"
              className="input text-sm col-span-2"
              autoFocus
            />
            <input
              value={requestedBy}
              onChange={e => setRequestedBy(e.target.value)}
              placeholder="Solicitado por (cliente) *"
              className="input text-sm"
            />
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as ChangeRequestPriority)}
              className="input text-sm"
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label} prioridad</option>
              ))}
            </select>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción detallada del cambio…"
              rows={2}
              className="input text-sm col-span-2 resize-none"
            />
            <div className="relative">
              <input
                value={hours}
                onChange={e => setHours(e.target.value)}
                type="number"
                placeholder="Horas estimadas"
                className="input text-sm pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">hs</span>
            </div>
            <div className="relative">
              <input
                value={cost}
                onChange={e => setCost(e.target.value)}
                type="number"
                placeholder="Costo adicional"
                className="input text-sm pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{sym}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary text-xs py-2 px-4 flex-1">
              Registrar solicitud
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-xs py-2 px-4">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {changeRequests.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'pending', 'reviewing', 'approved', 'rejected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                filterStatus === s
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? `Todas (${changeRequests.length})` : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <AlertTriangle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Sin solicitudes de cambio registradas.</p>
          <p className="text-xs text-gray-300 mt-1">
            Registrá cada pedido del cliente para evitar scope creep.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(cr => {
            const pCfg = PRIORITY_CONFIG[cr.priority];
            const sCfg = STATUS_CONFIG[cr.status];
            const isExpanded = expandedId === cr.id;
            const isReviewing = reviewingId === cr.id;

            return (
              <div key={cr.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                {/* Row */}
                <div className="px-4 py-3 flex items-start gap-3">
                  <div className={`flex items-center gap-1.5 ${sCfg.color} shrink-0 mt-0.5`}>
                    {sCfg.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-dark">{cr.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pCfg.bg} ${pCfg.color}`}>
                        {pCfg.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Por: <span className="font-semibold text-gray-500">{cr.requestedBy}</span>
                      {' · '}
                      {new Date(cr.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      {cr.estimatedHours && ` · ${cr.estimatedHours}h`}
                      {cr.extraCost && ` · +${sym} ${cr.extraCost.toLocaleString()}`}
                    </p>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : cr.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/60 space-y-3">
                    {cr.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">{cr.description}</p>
                    )}
                    {cr.statusNote && (
                      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                        <p className="text-[11px] text-gray-500 font-semibold">Nota de resolución:</p>
                        <p className="text-xs text-gray-700 mt-0.5">{cr.statusNote}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {(cr.status === 'pending' || cr.status === 'reviewing') && (
                      isReviewing ? (
                        <div className="space-y-2">
                          <textarea
                            value={reviewNote}
                            onChange={e => setReviewNote(e.target.value)}
                            placeholder="Nota opcional (impacto, motivo, condiciones)…"
                            rows={2}
                            className="input text-xs resize-none"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setStatus(cr.id, 'approved', reviewNote)}
                              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                            </button>
                            <button
                              onClick={() => setStatus(cr.id, 'rejected', reviewNote)}
                              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Rechazar
                            </button>
                            <button
                              onClick={() => { setReviewingId(null); setReviewNote(''); }}
                              className="btn-secondary text-xs py-2 px-3"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {cr.status === 'pending' && (
                            <button
                              onClick={() => setStatus(cr.id, 'reviewing')}
                              className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Marcar en revisión
                            </button>
                          )}
                          <button
                            onClick={() => setReviewingId(cr.id)}
                            className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Resolver
                          </button>
                          <button
                            onClick={() => remove(cr.id)}
                            className="text-xs font-semibold text-gray-400 hover:text-danger px-3 py-1.5 rounded-lg transition-colors ml-auto"
                          >
                            Eliminar
                          </button>
                        </div>
                      )
                    )}

                    {(cr.status === 'approved' || cr.status === 'rejected') && (
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${sCfg.color}`}>
                          {sCfg.label} · {cr.resolvedAt ? new Date(cr.resolvedAt).toLocaleDateString('es-AR') : ''}
                        </span>
                        <button
                          onClick={() => remove(cr.id)}
                          className="text-xs text-gray-400 hover:text-danger transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChangeRequests;
