import React, { useState, useMemo } from 'react';
import { Copy, Check, Plus, X, Calendar, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AvailabilitySlot, MeetingRequest, TeamMember } from '../../types';

// ─── Types ───────────────────────────────────────────────

interface AvailabilityManagerProps {
  slots: AvailabilitySlot[];
  meetings: MeetingRequest[];
  bookingSlug: string;
  teamMembers: TeamMember[];
  ownerName: string;
  onAddSlot: (slot: AvailabilitySlot) => void;
  onRemoveSlot: (id: string) => void;
  onUpdateSlug: (slug: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────

const TIME_OPTIONS: string[] = [];
for (let h = 8; h <= 20; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 20) TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

function getWeekStart(offset: number): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ─── Component ───────────────────────────────────────────

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  slots,
  meetings,
  bookingSlug,
  teamMembers,
  ownerName,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlug,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('owner');
  const [addingFor, setAddingFor] = useState<string | null>(null); // date string
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [slugInput, setSlugInput] = useState(bookingSlug);
  const [slugSaved, setSlugSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Compute days for the current week (Mon–Sat)
  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const days = useMemo(
    () => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Slots for selected member
  const memberSlots = useMemo(
    () => slots.filter((s) => s.memberId === selectedMemberId),
    [slots, selectedMemberId]
  );

  // Booked slot ids
  const bookedSlotIds = useMemo(() => {
    const ids = new Set<string>();
    meetings.forEach((m) => {
      if (m.slotDate && m.memberIds.includes(selectedMemberId)) {
        // Mark slots that match this meeting
        slots.forEach((s) => {
          if (
            s.memberId === selectedMemberId &&
            s.date === m.slotDate &&
            s.startTime === m.startTime
          ) {
            ids.add(s.id);
          }
        });
      }
    });
    return ids;
  }, [meetings, slots, selectedMemberId]);

  const availableCount = memberSlots.filter((s) => !bookedSlotIds.has(s.id)).length;
  const bookedCount = bookedSlotIds.size;

  // Previous week's slots (for "copy week")
  const prevWeekStart = useMemo(() => getWeekStart(weekOffset - 1), [weekOffset]);
  const prevWeekDays = useMemo(
    () => Array.from({ length: 6 }, (_, i) => addDays(prevWeekStart, i)),
    [prevWeekStart]
  );

  function getSlotsForDay(date: Date) {
    const ds = toDateStr(date);
    return memberSlots
      .filter((s) => s.date === ds)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  function handleOpenAdd(dateStr: string) {
    setAddingFor(dateStr);
    setNewStart('09:00');
    setNewEnd('10:00');
  }

  function handleAddSlot() {
    if (!addingFor) return;
    if (newStart >= newEnd) return;
    const slot: AvailabilitySlot = {
      id: crypto.randomUUID(),
      memberId: selectedMemberId,
      date: addingFor,
      startTime: newStart,
      endTime: newEnd,
    };
    onAddSlot(slot);
    setAddingFor(null);
  }

  function handleCopyWeek() {
    const prevSlots = slots.filter((s) => {
      if (s.memberId !== selectedMemberId) return false;
      return prevWeekDays.some((d) => toDateStr(d) === s.date);
    });
    prevSlots.forEach((s) => {
      // Find corresponding day in current week
      const prevDayIndex = prevWeekDays.findIndex((d) => toDateStr(d) === s.date);
      if (prevDayIndex === -1) return;
      const targetDate = toDateStr(days[prevDayIndex]);
      // Avoid duplicates
      const exists = slots.some(
        (ex) =>
          ex.memberId === selectedMemberId &&
          ex.date === targetDate &&
          ex.startTime === s.startTime &&
          ex.endTime === s.endTime
      );
      if (!exists) {
        onAddSlot({
          id: crypto.randomUUID(),
          memberId: selectedMemberId,
          date: targetDate,
          startTime: s.startTime,
          endTime: s.endTime,
        });
      }
    });
  }

  function handleSaveSlug() {
    const clean = slugInput.trim().replace(/[^a-z0-9-]/gi, '').toLowerCase();
    setSlugInput(clean);
    onUpdateSlug(clean);
    setSlugSaved(true);
    setTimeout(() => setSlugSaved(false), 2000);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/book/${bookingSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const members = [
    { id: 'owner', name: ownerName, role: 'Propietario', color: '#1D4ED8' },
    ...teamMembers.map((m) => ({ id: m.id, name: m.name, role: m.role, color: m.color })),
  ];

  const weekLabel = `${days[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} – ${days[5].toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="space-y-6">
      {/* ── Booking link ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-dark text-sm">Link de reservas</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Slug editor */}
          <div className="flex-1">
            <label className="label">Tu slug único</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">{window.location.origin}/book/</span>
              <input
                className="input flex-1"
                value={slugInput}
                onChange={(e) =>
                  setSlugInput(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())
                }
                placeholder="tu-nombre"
                maxLength={40}
              />
              <button className="btn-primary gap-1.5" onClick={handleSaveSlug}>
                {slugSaved ? <Check className="w-4 h-4" /> : 'Guardar'}
              </button>
            </div>
          </div>

          {/* Copy link */}
          <div className="sm:self-end">
            <button
              className="btn-secondary gap-2"
              onClick={handleCopyLink}
              title="Copiar link"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar link'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Disponibles</p>
            <p className="text-xl font-bold text-dark">{availableCount}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-success" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Reservados</p>
            <p className="text-xl font-bold text-dark">{bookedCount}</p>
          </div>
        </div>
      </div>

      {/* ── Member tabs ── */}
      {members.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMemberId(m.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedMemberId === m.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: m.color }}
              >
                {m.name.charAt(0).toUpperCase()}
              </span>
              {m.id === 'owner' ? 'Yo' : m.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Weekly calendar ── */}
      <div className="card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary !px-2 !py-1.5"
              onClick={() => setWeekOffset((w) => w - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-dark">{weekLabel}</span>
            <button
              className="btn-secondary !px-2 !py-1.5"
              onClick={() => setWeekOffset((w) => w + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button className="btn-secondary gap-2 text-xs" onClick={handleCopyWeek}>
            <Copy className="w-3.5 h-3.5" />
            Copiar semana anterior
          </button>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {days.map((day, i) => {
            const dateStr = toDateStr(day);
            const daySlots = getSlotsForDay(day);
            const isAdding = addingFor === dateStr;
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={dateStr}
                className={`rounded-std border p-3 flex flex-col gap-2 min-h-[120px] transition-colors ${
                  isPast ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100'
                }`}
              >
                {/* Day label */}
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {DAY_LABELS[i]}
                  </p>
                  <p className="text-sm font-bold text-dark">
                    {day.getDate()}
                  </p>
                </div>

                {/* Existing slots */}
                <div className="flex flex-col gap-1 flex-1">
                  {daySlots.map((slot) => {
                    const isBooked = bookedSlotIds.has(slot.id);
                    return (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${
                          isBooked
                            ? 'bg-success-light text-success border border-success-mid'
                            : 'bg-primary-light text-primary border border-primary-mid'
                        }`}
                      >
                        <span className="truncate">
                          {slot.startTime}–{slot.endTime}
                        </span>
                        {!isBooked && (
                          <button
                            onClick={() => onRemoveSlot(slot.id)}
                            className="flex-shrink-0 hover:text-danger transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Inline add form */}
                {isAdding ? (
                  <div className="space-y-1.5">
                    <select
                      className="input !py-1 !text-xs"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <select
                      className="input !py-1 !text-xs"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                    >
                      {TIME_OPTIONS.filter((t) => t > newStart).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <button
                        className="flex-1 btn-primary !py-1 !text-[10px] !px-2"
                        onClick={handleAddSlot}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        className="flex-1 btn-secondary !py-1 !text-[10px] !px-2"
                        onClick={() => setAddingFor(null)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  !isPast && (
                    <button
                      onClick={() => handleOpenAdd(dateStr)}
                      className="w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg py-1 transition-colors border border-dashed border-gray-200 hover:border-primary-mid"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;
