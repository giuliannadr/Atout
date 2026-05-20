import React, { useState, useEffect } from 'react';
import { X, Copy, Check, MessageCircle, Eye, EyeOff } from 'lucide-react';
import type { CMCalendarShare, CalendarComment } from '../../types';

const BASE_URL = 'https://atout-delta.vercel.app';

/** Generate list of months: last 3 + current + next 6 */
function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  for (let delta = -3; delta <= 6; delta++) {
    const d = new Date(now.getFullYear(), now.getMonth() + delta, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
    options.push({ value, label });
  }
  return options;
}

interface CalendarShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentShare?: CMCalendarShare;
  comments: CalendarComment[];
  onSave: (share: CMCalendarShare) => void;
  onMarkCommentsRead: (ids: string[]) => void;
}

const CalendarShareModal: React.FC<CalendarShareModalProps> = ({
  isOpen,
  onClose,
  projectId,
  currentShare,
  comments,
  onSave,
  onMarkCommentsRead,
}) => {
  const monthOptions = getMonthOptions();

  const [enabled, setEnabled] = useState(currentShare?.enabled ?? false);
  const [allMonths, setAllMonths] = useState(currentShare?.sharedMonths === 'all' || !currentShare);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(
    Array.isArray(currentShare?.sharedMonths) ? (currentShare!.sharedMonths as string[]) : []
  );
  const [clientName, setClientName] = useState(currentShare?.clientName ?? '');
  const [copied, setCopied] = useState(false);
  const [showUnread, setShowUnread] = useState(false);

  useEffect(() => {
    if (currentShare) {
      setEnabled(currentShare.enabled);
      setAllMonths(currentShare.sharedMonths === 'all');
      setSelectedMonths(Array.isArray(currentShare.sharedMonths) ? currentShare.sharedMonths as string[] : []);
      setClientName(currentShare.clientName ?? '');
    }
  }, [currentShare, isOpen]);

  if (!isOpen) return null;

  const shareUrl = `${BASE_URL}/calendar/share/${projectId}`;
  const unreadComments = comments.filter(c => !c.isRead);
  const unreadIds = unreadComments.map(c => c.id);

  const toggleMonth = (value: string) => {
    setSelectedMonths(prev =>
      prev.includes(value) ? prev.filter(m => m !== value) : [...prev, value]
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: no-op
    }
  };

  const handleSave = () => {
    onSave({
      enabled,
      sharedMonths: allMonths ? 'all' : selectedMonths,
      clientName: clientName.trim() || undefined,
      createdAt: currentShare?.createdAt ?? new Date().toISOString(),
    });
    onClose();
  };

  const handleMarkAllRead = () => {
    onMarkCommentsRead(unreadIds);
    setShowUnread(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-dark">Compartir calendario</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-dark rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-dark">Activar vista para el cliente</p>
              <p className="text-xs text-gray-400 mt-0.5">
                El cliente podrá ver el calendario y dejar comentarios
              </p>
            </div>
            <button
              onClick={() => setEnabled(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-violet-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {enabled && (
            <>
              {/* Share link */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">
                  Enlace para compartir
                </label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                  <span className="text-xs text-gray-600 flex-1 break-all">{shareUrl}</span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-1.5 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors"
                    title="Copiar enlace"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && <p className="text-xs text-emerald-600 mt-1">¡Enlace copiado!</p>}
              </div>

              {/* Client name */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">
                  Nombre del cliente (opcional)
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Ej: Marca XYZ"
                  className="input"
                />
                <p className="text-[11px] text-gray-400 mt-1">Se mostrará en el encabezado del calendario público</p>
              </div>

              {/* Month selection */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">
                  Meses visibles
                </label>
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allMonths}
                    onChange={e => setAllMonths(e.target.checked)}
                    className="w-4 h-4 accent-violet-500 rounded"
                  />
                  <span className="text-sm font-medium text-dark">Todos los meses</span>
                </label>
                {!allMonths && (
                  <div className="grid grid-cols-2 gap-2">
                    {monthOptions.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMonths.includes(opt.value)}
                          onChange={() => toggleMonth(opt.value)}
                          className="w-3.5 h-3.5 accent-violet-500 rounded"
                        />
                        <span className="text-xs text-gray-600">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Comments section */}
          {comments.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-bold text-dark">
                    Comentarios del cliente
                  </span>
                  {unreadComments.length > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                      {unreadComments.length} sin leer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadComments.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-bold text-violet-600 hover:text-violet-700"
                    >
                      Marcar leídos
                    </button>
                  )}
                  <button
                    onClick={() => setShowUnread(v => !v)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showUnread ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {showUnread && (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {(unreadComments.length > 0 ? unreadComments : comments).map(c => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl text-xs ${!c.isRead ? 'bg-violet-50 border border-violet-100' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-dark">{c.authorName}</span>
                        <span className="text-gray-400">
                          {c.targetDate ? c.targetDate : 'General'}
                          {' · '}
                          {new Date(c.createdAt).toLocaleString('es-AR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="btn-primary bg-violet-600 hover:bg-violet-700 text-sm flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarShareModal;
