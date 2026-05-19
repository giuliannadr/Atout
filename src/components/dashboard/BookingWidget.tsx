import React, { useState } from 'react';
import {
  Link2, Copy, Check, Calendar, Clock,
  CheckCircle2, XCircle, AlertCircle, Settings2, Zap, ChevronRight,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { MeetingRequest, WorkSchedule } from '../../types';
import { DEFAULT_WORK_SCHEDULE } from '../../types';
import ScheduleSetup from '../availability/ScheduleSetup';

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ─────────────────────────────────────────────────────────────────────────────

const BookingWidget: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateMeeting,
    setWorkSchedule,
    generateSlotsFromSchedule,
  } = useSettingsStore();

  const [copied, setCopied]           = useState(false);
  const [slugEdit, setSlugEdit]       = useState(false);
  const [slugVal, setSlugVal]         = useState(settings.bookingSlug ?? '');
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeTab, setActiveTab]     = useState<'upcoming' | 'pending'>('upcoming');

  const bookingUrl = settings.bookingSlug
    ? `${window.location.origin}/book/${settings.bookingSlug}`
    : null;

  const handleCopy = () => {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const saveSlug = () => {
    const clean = slugVal.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (clean) updateSettings({ bookingSlug: clean });
    setSlugEdit(false);
  };

  const pendingMeetings = (settings.meetings ?? []).filter(m => m.status === 'pending');
  const upcomingMeetings = (settings.meetings ?? [])
    .filter(m => m.status === 'confirmed' && new Date(m.slotDate) >= new Date())
    .sort((a, b) => a.slotDate.localeCompare(b.slotDate))
    .slice(0, 5);

  const confirmMeeting = (meeting: MeetingRequest) => {
    updateMeeting({ ...meeting, status: 'confirmed' });
    const slots = settings.availabilitySlots ?? [];
    const slot = slots.find(s =>
      s.date === meeting.slotDate &&
      s.startTime === meeting.startTime &&
      meeting.memberIds.includes(s.memberId)
    );
    if (slot) {
      updateSettings({
        availabilitySlots: slots.map(s =>
          s.id === slot.id ? { ...s, isBooked: true, meetingId: meeting.id } : s
        ),
      });
    }
  };

  const rejectMeeting = (meeting: MeetingRequest) =>
    updateMeeting({ ...meeting, status: 'cancelled' });

  const handleScheduleSave = (schedule: WorkSchedule) => {
    setWorkSchedule(schedule);
    generateSlotsFromSchedule(schedule, 'owner');
    setShowSchedule(false);
  };

  const currentSchedule = settings.workSchedule ?? DEFAULT_WORK_SCHEDULE;
  const freeSlots = (settings.availabilitySlots ?? []).filter(
    s => s.memberId === 'owner' && !s.isBooked
  ).length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-dark text-sm leading-tight">Reservas</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {freeSlots > 0 ? `${freeSlots} horarios libres` : 'Sin horarios configurados'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSchedule(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
              showSchedule
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Configurar
          </button>
        </div>
      </div>

      {/* ── Schedule Setup (expandable) ────────────────────────── */}
      {showSchedule && (
        <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-6">
          <ScheduleSetup
            initial={currentSchedule}
            onSave={handleScheduleSave}
            onCancel={() => setShowSchedule(false)}
          />
        </div>
      )}

      {/* ── Booking link ───────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-gray-100">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Link para clientes
        </p>

        {slugEdit ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
              <span className="shrink-0">{window.location.origin}/book/</span>
              <input
                value={slugVal}
                onChange={e => setSlugVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveSlug()}
                className="flex-1 bg-transparent outline-none text-dark font-medium min-w-0"
                placeholder="tu-nombre"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button onClick={saveSlug} className="btn-primary text-xs py-2 px-4 flex-1">
                Guardar
              </button>
              <button
                onClick={() => setSlugEdit(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : bookingUrl ? (
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
            <Link2 className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs text-primary font-semibold truncate flex-1 min-w-0">
              {bookingUrl}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                title="Copiar link"
                className="text-primary/60 hover:text-primary transition-colors"
              >
                {copied
                  ? <Check className="w-4 h-4 text-emerald-500" />
                  : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { setSlugVal(settings.bookingSlug ?? ''); setSlugEdit(true); }}
                title="Editar"
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setSlugVal(''); setSlugEdit(true); }}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm font-medium text-gray-400 hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Zap className="w-4 h-4" />
            Activar link de reservas
          </button>
        )}
      </div>

      {/* ── Schedule summary chips ─────────────────────────────── */}
      {!showSchedule && (
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 rounded-lg px-3 py-1.5 text-[11px] font-semibold">
            <Clock className="w-3 h-3 shrink-0" />
            {currentSchedule.startTime} – {currentSchedule.endTime}
          </span>
          <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 rounded-lg px-3 py-1.5 text-[11px] font-semibold">
            {currentSchedule.days.sort().map(d => DAYS_SHORT[d]).join(' · ')}
          </span>
          <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 rounded-lg px-3 py-1.5 text-[11px] font-semibold">
            <Calendar className="w-3 h-3 shrink-0" />
            {currentSchedule.meetingDuration} min
          </span>
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="flex">
        {([
          { key: 'upcoming' as const, label: 'Próximas',   count: upcomingMeetings.length },
          { key: 'pending'  as const, label: 'Solicitudes', count: pendingMeetings.length  },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-colors border-b-2 ${
              activeTab === t.key
                ? 'border-primary text-primary'
                : 'border-gray-100 text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                t.key === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-primary/10 text-primary'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────── */}
      <div className="divide-y divide-gray-50 min-h-[80px]">
        {activeTab === 'upcoming' && (
          upcomingMeetings.length === 0
            ? <EmptyTabState text="No hay reuniones confirmadas próximas." />
            : upcomingMeetings.map(m => <UpcomingRow key={m.id} meeting={m} />)
        )}
        {activeTab === 'pending' && (
          pendingMeetings.length === 0
            ? <EmptyTabState text="No hay solicitudes pendientes." />
            : pendingMeetings.map(m => (
                <PendingRow
                  key={m.id}
                  meeting={m}
                  onConfirm={() => confirmMeeting(m)}
                  onReject={() => rejectMeeting(m)}
                />
              ))
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="px-6 py-3.5 bg-gray-50/60 border-t border-gray-100">
        <a
          href="/settings"
          className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors font-semibold"
        >
          Configuración avanzada
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const EmptyTabState: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-10 text-center px-6">
    <p className="text-xs text-gray-400">{text}</p>
  </div>
);

const UpcomingRow: React.FC<{ meeting: MeetingRequest }> = ({ meeting }) => {
  const d = new Date(`${meeting.slotDate}T${meeting.startTime}`);
  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
      {/* Date chip */}
      <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-emerald-600 uppercase leading-none">
          {d.toLocaleDateString('es-AR', { weekday: 'short' })}
        </span>
        <span className="text-sm font-black text-emerald-700 leading-tight">
          {d.getDate()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dark truncate">{meeting.clientName}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {d.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })} · {meeting.startTime}–{meeting.endTime}
        </p>
        {meeting.brief && (
          <p className="text-[11px] text-gray-400 truncate mt-0.5 italic">"{meeting.brief}"</p>
        )}
      </div>

      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
    </div>
  );
};

const PendingRow: React.FC<{
  meeting: MeetingRequest;
  onConfirm: () => void;
  onReject: () => void;
}> = ({ meeting, onConfirm, onReject }) => {
  const d = new Date(`${meeting.slotDate}T${meeting.startTime}`);
  return (
    <div className="px-6 py-4 hover:bg-amber-50/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dark">{meeting.clientName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{meeting.clientEmail}</p>
          <p className="text-xs text-gray-500 mt-1">
            {d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} · {meeting.startTime}–{meeting.endTime}
          </p>
          {meeting.brief && (
            <p className="text-xs text-gray-400 mt-1.5 italic line-clamp-2">"{meeting.brief}"</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pl-13">
        <button
          onClick={onConfirm}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Confirmar
        </button>
        <button
          onClick={onReject}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          Rechazar
        </button>
      </div>
    </div>
  );
};

export default BookingWidget;
