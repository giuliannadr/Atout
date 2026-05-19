import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, Calendar, Clock, User, Users, ArrowLeft } from 'lucide-react';
import { fetchPublicAvailability, submitMeetingRequest } from '../api/booking';
import type { PublicBookingData } from '../api/booking';
import type { AvailabilitySlot, TeamMember, MeetingRequest } from '../types';

// ─── Helpers ─────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startPad = firstDay === 0 ? 6 : firstDay - 1; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: (Date | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    result.push(new Date(year, month, d));
  }
  return result;
}

const BUDGET_OPTIONS = [
  { value: '<500', label: 'Menos de $500' },
  { value: '500-2000', label: '$500 – $2.000' },
  { value: '2000-5000', label: '$2.000 – $5.000' },
  { value: '5000+', label: '$5.000+' },
  { value: 'unknown', label: 'Aún no sé' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── Inline spinner ───────────────────────────────────────

const Spinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-white">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Cargando disponibilidad...</p>
    </div>
  </div>
);

// ─── Step 0: Pick member ──────────────────────────────────

interface MemberPickerProps {
  ownerName: string;
  teamMembers: TeamMember[];
  onSelect: (ids: string[]) => void;
}

const MemberPicker: React.FC<MemberPickerProps> = ({ ownerName, teamMembers, onSelect }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const members = [
    { id: 'owner', name: ownerName, role: 'Propietario', color: '#7C3AED' },
    ...teamMembers,
  ];

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">¿Con quién querés reunirte?</h2>
        <p className="text-sm text-gray-500 mt-1">Podés seleccionar uno o más integrantes del equipo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {members.map((m) => {
          const isSelected = selected.has(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50'
              }`}
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: m.color ?? '#7C3AED' }}
              >
                {getInitials(m.name)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                <p className="text-xs text-gray-500">{m.role}</p>
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />}
            </button>
          );
        })}

        {/* "Todo el equipo" */}
        {members.length > 1 && (
          <button
            onClick={() => onSelect(members.map((m) => m.id))}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-violet-300 bg-white hover:bg-violet-50 text-left transition-all col-span-full sm:col-span-1"
          >
            <span className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-violet-500" />
            </span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Todo el equipo</p>
              <p className="text-xs text-gray-500">Buscar horario con todos disponibles</p>
            </div>
          </button>
        )}
      </div>

      <button
        disabled={selected.size === 0}
        onClick={() => onSelect(Array.from(selected))}
        className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar
      </button>
    </div>
  );
};

// ─── Step 1: Pick date + time ─────────────────────────────

interface DatePickerProps {
  slots: AvailabilitySlot[];
  selectedMemberIds: string[];
  onSelect: (date: string, time: { startTime: string; endTime: string }) => void;
}

const DateTimePicker: React.FC<DatePickerProps> = ({ slots, selectedMemberIds, onSelect }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Available dates: slots where ALL selected members have a free slot at the same time
  const availableDates = useMemo(() => {
    const dateMap = new Map<string, Set<string>>(); // date → set of "HH:MM-HH:MM"

    for (const memberId of selectedMemberIds) {
      const memberSlots = slots.filter((s) => s.memberId === memberId && !s.isBooked);
      for (const s of memberSlots) {
        const key = `${s.startTime}-${s.endTime}`;
        if (!dateMap.has(s.date)) dateMap.set(s.date, new Set());
        dateMap.get(s.date)!.add(`${memberId}:${key}`);
      }
    }

    // For each date, find time keys present for all members
    const result = new Map<string, { startTime: string; endTime: string }[]>();

    dateMap.forEach((entrySet, date) => {
      // Group by timeslot
      const bySlot = new Map<string, Set<string>>();
      entrySet.forEach((entry) => {
        const colonIdx = entry.indexOf(':');
        const memberId = entry.slice(0, colonIdx);
        const slot = entry.slice(colonIdx + 1);
        if (!bySlot.has(slot)) bySlot.set(slot, new Set());
        bySlot.get(slot)!.add(memberId);
      });

      const validSlots: { startTime: string; endTime: string }[] = [];
      bySlot.forEach((memberSet, slotKey) => {
        if (selectedMemberIds.every((id) => memberSet.has(id))) {
          const [startTime, endTime] = slotKey.split('-');
          validSlots.push({ startTime, endTime });
        }
      });

      if (validSlots.length > 0) {
        result.set(date, validSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)));
      }
    });

    return result;
  }, [slots, selectedMemberIds]);

  const calendarDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const timeSlotsForSelected = selectedDate ? (availableDates.get(selectedDate) ?? []) : [];

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Elegí un día y horario</h2>
        <p className="text-sm text-gray-500 mt-1">Los días marcados tienen horarios disponibles.</p>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <span className="text-sm font-semibold text-gray-800 capitalize">{monthLabel}</span>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 text-center border-b border-gray-100">
          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => (
            <div key={d} className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} className="h-10" />;
            const ds = toDateStr(day);
            const hasSlots = availableDates.has(ds);
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
            const isSelected = selectedDate === ds;

            return (
              <button
                key={ds}
                disabled={!hasSlots || isPast}
                onClick={() => setSelectedDate(ds)}
                className={`h-10 flex flex-col items-center justify-center text-sm font-medium transition-all relative ${
                  isSelected
                    ? 'bg-violet-600 text-white rounded-lg'
                    : hasSlots && !isPast
                    ? 'text-gray-800 hover:bg-violet-50 rounded-lg cursor-pointer'
                    : 'text-gray-300 cursor-default'
                }`}
              >
                {day.getDate()}
                {hasSlots && !isPast && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-violet-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            Horarios disponibles —{' '}
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          {timeSlotsForSelected.length === 0 ? (
            <p className="text-sm text-gray-400">No hay horarios disponibles para este día.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {timeSlotsForSelected.map((ts) => (
                <button
                  key={`${ts.startTime}-${ts.endTime}`}
                  onClick={() => onSelect(selectedDate, ts)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-violet-200 bg-violet-50 text-violet-700 font-semibold text-sm hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {ts.startTime} – {ts.endTime}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Step 2: Client details ───────────────────────────────

interface ClientFormProps {
  selectedDate: string;
  selectedTime: { startTime: string; endTime: string };
  selectedMembers: { id: string; name: string }[];
  onSubmit: (data: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    brief: string;
    budget: string;
    deadline: string;
  }) => void;
  isSubmitting: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  selectedDate,
  selectedTime,
  selectedMembers,
  onSubmit,
  isSubmitting,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [brief, setBrief] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ clientName, clientEmail, clientPhone, brief, budget, deadline });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tus datos</h2>
        <p className="text-sm text-gray-500 mt-1">Estás agendando para:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-semibold border border-violet-200">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-semibold border border-violet-200">
            <Clock className="w-3.5 h-3.5" />
            {selectedTime.startTime} – {selectedTime.endTime}
          </span>
          {selectedMembers.map((m) => (
            <span key={m.id} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
              {m.name}
            </span>
          ))}
        </div>
      </div>

      {/* Personal info */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Nombre completo <span className="text-red-400">*</span>
          </label>
          <input
            required
            className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            required
            type="email"
            className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Teléfono / WhatsApp <span className="text-gray-300">(opcional)</span>
          </label>
          <input
            type="tel"
            className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="+54 9 11 1234-5678"
          />
        </div>
      </div>

      {/* Mini brief */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sobre tu proyecto</p>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            ¿De qué trata tu proyecto?
          </label>
          <textarea
            rows={3}
            className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all resize-none"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Contanos brevemente qué necesitás..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            ¿Cuál es tu presupuesto aproximado?
          </label>
          <select
            className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all bg-white"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            <option value="">Seleccioná una opción</option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            ¿Cuándo necesitás tenerlo listo?
          </label>
          <input
            type="date"
            className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          'Confirmar reserva'
        )}
      </button>
    </form>
  );
};

// ─── Confirmation ─────────────────────────────────────────

interface ConfirmationProps {
  clientName: string;
  selectedDate: string;
  selectedTime: { startTime: string; endTime: string };
  selectedMembers: { id: string; name: string; color?: string }[];
}

const Confirmation: React.FC<ConfirmationProps> = ({
  clientName,
  selectedDate,
  selectedTime,
  selectedMembers,
}) => {
  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">¡Reserva confirmada!</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Hola <strong>{clientName}</strong>, tu solicitud fue enviada. Pronto recibirás una confirmación.
        </p>
      </div>

      <div className="bg-violet-50 rounded-xl p-5 text-left space-y-3 border border-violet-100">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-violet-500" />
          <span className="capitalize">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock className="w-4 h-4 text-violet-500" />
          <span>{selectedTime.startTime} – {selectedTime.endTime}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <Users className="w-4 h-4 text-violet-500 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {selectedMembers.map((m) => (
              <span
                key={m.id}
                className="px-2 py-0.5 rounded-full text-white text-xs font-semibold"
                style={{ backgroundColor: m.color ?? '#7C3AED' }}
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Si tenés alguna duda, respondé el correo de confirmación.
      </p>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────

const BookingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [data, setData] = useState<PublicBookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Multi-step state
  const [step, setStep] = useState(0); // 0=member, 1=date, 2=form, 3=done
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<{ startTime: string; endTime: string } | null>(null);
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchPublicAvailability(slug)
      .then((d) => {
        if (!d) {
          setNotFound(true);
        } else {
          setData(d);
          // If no team members, skip step 0
          if (!d.teamMembers || d.teamMembers.length === 0) {
            setSelectedMemberIds(['owner']);
            setStep(1);
          }
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const allMembers = useMemo(() => {
    if (!data) return [];
    return [
      { id: 'owner', name: data.ownerName, role: 'Propietario', color: '#7C3AED' },
      ...data.teamMembers,
    ];
  }, [data]);

  const selectedMemberObjects = useMemo(
    () => allMembers.filter((m) => selectedMemberIds.includes(m.id)),
    [allMembers, selectedMemberIds]
  );

  async function handleSubmitForm(formData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    brief: string;
    budget: string;
    deadline: string;
  }) {
    if (!slug || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    setClientName(formData.clientName);
    try {
      const briefText = [
        formData.brief,
        formData.budget ? `Presupuesto: ${BUDGET_OPTIONS.find((o) => o.value === formData.budget)?.label}` : '',
        formData.deadline ? `Fecha límite: ${formData.deadline}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const request: Omit<MeetingRequest, 'id' | 'createdAt' | 'status'> = {
        memberIds: selectedMemberIds,
        slotDate: selectedDate,
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone || undefined,
        brief: briefText || undefined,
      };
      await submitMeetingRequest(slug, request);
      setStep(3);
    } catch {
      alert('Hubo un error al enviar la solicitud. Por favor, intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────

  if (loading) return <Spinner />;

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-white px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Página no encontrada</h1>
          <p className="text-sm text-gray-500">
            No encontramos esta página de reservas. Verificá el link o contactá al equipo directamente.
          </p>
        </div>
      </div>
    );
  }

  const canGoBack = step > 0 && step < 3 && !(step === 1 && data.teamMembers.length === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b border-violet-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          {canGoBack && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1">
            <p className="text-xs text-violet-500 font-semibold uppercase tracking-wider">Agendar reunión</p>
            <h1 className="text-base font-bold text-gray-900">{data.ownerName}</h1>
          </div>
          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((s) => {
                // Skip step 0 indicator if no team
                if (s === 0 && data.teamMembers.length === 0) return null;
                const adjustedStep = data.teamMembers.length === 0 ? step - 1 : step;
                const adjustedS = data.teamMembers.length === 0 ? s - 1 : s;
                const isActive = adjustedS === adjustedStep;
                const isDone = adjustedS < adjustedStep;
                return (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isActive ? 'bg-violet-600 w-4' : isDone ? 'bg-violet-400' : 'bg-gray-200'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Step 0: Member picker */}
          {step === 0 && (
            <MemberPicker
              ownerName={data.ownerName}
              teamMembers={data.teamMembers}
              onSelect={(ids) => {
                setSelectedMemberIds(ids);
                setStep(1);
              }}
            />
          )}

          {/* Step 1: Date + time */}
          {step === 1 && (
            <DateTimePicker
              slots={data.slots}
              selectedMemberIds={selectedMemberIds}
              onSelect={(date, time) => {
                setSelectedDate(date);
                setSelectedTime(time);
                setStep(2);
              }}
            />
          )}

          {/* Step 2: Client form */}
          {step === 2 && selectedTime && (
            <ClientForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedMembers={selectedMemberObjects}
              onSubmit={handleSubmitForm}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && selectedTime && (
            <Confirmation
              clientName={clientName}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedMembers={selectedMemberObjects}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by Atout
        </p>
      </div>
    </div>
  );
};

export default BookingPage;
