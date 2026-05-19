import React, { useState } from 'react';
import { Zap, RotateCcw } from 'lucide-react';
import type { WorkSchedule } from '../../types';
import { DEFAULT_WORK_SCHEDULE } from '../../types';

const DAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 22; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 22) TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

const DURATION_OPTIONS = [
  { value: 30,  label: '30 min'    },
  { value: 45,  label: '45 min'    },
  { value: 60,  label: '1 hora'    },
  { value: 90,  label: '1 h 30'    },
  { value: 120, label: '2 horas'   },
];

const BUFFER_OPTIONS = [
  { value: 0,  label: 'Sin pausa' },
  { value: 15, label: '15 min'   },
  { value: 30, label: '30 min'   },
];

const WEEKS_OPTIONS = [
  { value: 2, label: '2 sem' },
  { value: 4, label: '4 sem' },
  { value: 8, label: '8 sem' },
];

interface ScheduleSetupProps {
  initial?: WorkSchedule;
  onSave: (schedule: WorkSchedule) => void;
  onCancel: () => void;
}

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
    {children}
  </p>
);

const ScheduleSetup: React.FC<ScheduleSetupProps> = ({
  initial = DEFAULT_WORK_SCHEDULE,
  onSave,
  onCancel,
}) => {
  const [days,            setDays]            = useState<number[]>(initial.days);
  const [startTime,       setStartTime]       = useState(initial.startTime);
  const [endTime,         setEndTime]         = useState(initial.endTime);
  const [meetingDuration, setMeetingDuration] = useState(initial.meetingDuration);
  const [bufferBetween,   setBufferBetween]   = useState(initial.bufferBetween);
  const [weeksAhead,      setWeeksAhead]      = useState(initial.weeksAhead);

  const toggleDay = (d: number) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleReset = () => {
    setDays(DEFAULT_WORK_SCHEDULE.days);
    setStartTime(DEFAULT_WORK_SCHEDULE.startTime);
    setEndTime(DEFAULT_WORK_SCHEDULE.endTime);
    setMeetingDuration(DEFAULT_WORK_SCHEDULE.meetingDuration);
    setBufferBetween(DEFAULT_WORK_SCHEDULE.bufferBetween);
    setWeeksAhead(DEFAULT_WORK_SCHEDULE.weeksAhead);
  };

  const handleSave = () => {
    if (days.length === 0) return;
    onSave({ days, startTime, endTime, meetingDuration, bufferBetween, weeksAhead });
  };

  // Preview: how many slots will be generated
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH,   endM]   = endTime.split(':').map(Number);
  const rangeMin = (endH * 60 + endM) - (startH * 60 + startM);
  const slotsPerDay = rangeMin > 0 ? Math.floor(rangeMin / (meetingDuration + bufferBetween)) : 0;
  const totalSlots  = slotsPerDay * days.length * weeksAhead;

  return (
    <div className="space-y-6">

      {/* Title */}
      <div>
        <p className="font-bold text-dark text-sm">Horario de trabajo</p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          Configurá tus días y horas disponibles. Los horarios se generarán
          automáticamente para que tus clientes puedan reservar.
        </p>
      </div>

      {/* Days */}
      <div>
        <SectionLabel>Días disponibles</SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleDay(value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                days.includes(value)
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {days.length === 0 && (
          <p className="text-[11px] text-danger mt-2">Seleccioná al menos un día.</p>
        )}
      </div>

      {/* Hours */}
      <div>
        <SectionLabel>Horario</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Desde</label>
            <select
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="input text-sm"
            >
              {TIME_OPTIONS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Hasta</label>
            <select
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="input text-sm"
            >
              {TIME_OPTIONS.filter(t => t > startTime).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Duration & buffer */}
      <div>
        <SectionLabel>Duración de reunión</SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {DURATION_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setMeetingDuration(o.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                meetingDuration === o.value
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Pausa entre turnos</SectionLabel>
        <div className="flex gap-2">
          {BUFFER_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setBufferBetween(o.value)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                bufferBetween === o.value
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weeks ahead */}
      <div>
        <SectionLabel>Generar disponibilidad para</SectionLabel>
        <div className="flex gap-2">
          {WEEKS_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setWeeksAhead(o.value)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                weeksAhead === o.value
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview banner */}
      {totalSlots > 0 && (
        <div className="bg-primary/6 border border-primary/15 rounded-xl px-4 py-3.5 flex items-start gap-3">
          <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary">{totalSlots} horarios disponibles</p>
            <p className="text-[11px] text-primary/70 mt-0.5">
              {slotsPerDay} por día · {days.length} días/sem · {weeksAhead} semanas
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restablecer
        </button>
        <div className="flex-1" />
        <button type="button" onClick={onCancel} className="btn-secondary text-xs py-2 px-4">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={days.length === 0 || totalSlots === 0}
          className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
        >
          Generar horarios
        </button>
      </div>
    </div>
  );
};

export default ScheduleSetup;
