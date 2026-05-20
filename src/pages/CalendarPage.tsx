import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ArrowLeft,
  Calendar, CheckSquare, Video, Clock,
  Circle, AlertCircle,
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import { useProjectStore } from '../store/projectStore';
import { useSettingsStore } from '../store/settingsStore';
import type { Task, MeetingRequest, ContentPost } from '../types';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

type CalendarEvent =
  | { kind: 'task'; data: Task; projectId: string; projectName: string }
  | { kind: 'meeting'; data: MeetingRequest }
  | { kind: 'post'; data: ContentPost; accountName: string };

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-400',
  normal: 'bg-blue-400',
  low: 'bg-gray-300',
};

const STATUS_LABEL: Record<string, string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  review: 'En revisión',
  done: 'Listo',
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const { settings } = useSettingsStore();

  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(today);
  const [filter, setFilter] = useState<'all' | 'tasks' | 'meetings' | 'posts'>('all');

  const year = current.getFullYear();
  const month = current.getMonth();

  // Build all calendar events
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];

    // Tasks from all projects
    for (const p of projects) {
      for (const task of p.tasks ?? []) {
        if (task.dueDate) {
          events.push({ kind: 'task', data: task, projectId: p.id, projectName: p.name });
        }
      }
    }

    // Meetings
    for (const m of settings.meetings ?? []) {
      events.push({ kind: 'meeting', data: m });
    }

    // CM: content posts
    for (const p of projects) {
      for (const post of p.contentPosts ?? []) {
        events.push({ kind: 'post', data: post, accountName: p.name });
      }
    }

    return events;
  }, [projects, settings.meetings]);

  // Events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of allEvents) {
      let dateStr: string | undefined;
      if (ev.kind === 'task') dateStr = ev.data.dueDate;
      else if (ev.kind === 'meeting') dateStr = ev.data.slotDate;
      else if (ev.kind === 'post') dateStr = ev.data.date;

      if (!dateStr) continue;
      const key = dateStr.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [allEvents]);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedKey = selectedDay ? selectedDay.toISOString().slice(0, 10) : null;
  const selectedEvents = (selectedKey ? (eventsByDate.get(selectedKey) ?? []) : [])
    .filter(ev => filter === 'all' || ev.kind === (filter === 'posts' ? 'post' : filter === 'tasks' ? 'task' : 'meeting'));

  const formatTime = (t: string) => t; // already "HH:MM"

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Topbar onNewProject={() => {}} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-dark flex items-center gap-2">
              <Calendar className="w-6 h-6 text-violet-500" /> Mi Calendario
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Tareas, reuniones y contenido en un solo lugar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Month nav */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <button onClick={() => setCurrent(new Date(year, month - 1, 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-bold text-dark">{MONTHS[month]} {year}</h2>
                <button onClick={() => setCurrent(new Date(year, month + 1, 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-50">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[11px] font-bold text-gray-400 uppercase py-2">{d}</div>
                ))}
              </div>

              {/* Cells */}
              <div className="grid grid-cols-7">
                {cells.map((date, i) => {
                  if (!date) return <div key={i} className="min-h-[80px] border-b border-r border-gray-50" />;
                  const key = date.toISOString().slice(0, 10);
                  const evs = eventsByDate.get(key) ?? [];
                  const isToday = isSameDay(date, today);
                  const isSelected = selectedDay && isSameDay(date, selectedDay);

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(date)}
                      className={`min-h-[80px] border-b border-r border-gray-50 p-2 text-left transition-colors hover:bg-violet-50 ${
                        isSelected ? 'bg-violet-50 ring-2 ring-inset ring-violet-300' : ''
                      }`}
                    >
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                        isToday ? 'bg-violet-600 text-white' : 'text-gray-500'
                      }`}>
                        {date.getDate()}
                      </span>
                      <div className="flex flex-wrap gap-0.5">
                        {evs.slice(0, 4).map((ev, j) => (
                          <div key={j} className={`w-2 h-2 rounded-full ${
                            ev.kind === 'task'
                              ? (PRIORITY_COLOR[ev.data.priority ?? 'normal'] ?? 'bg-blue-400')
                              : ev.kind === 'meeting'
                                ? 'bg-emerald-400'
                                : 'bg-pink-400'
                          }`} />
                        ))}
                        {evs.length > 4 && <span className="text-[9px] text-gray-400">+{evs.length - 4}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 px-1">
              {[
                { color: 'bg-blue-400', label: 'Tarea' },
                { color: 'bg-emerald-400', label: 'Reunión' },
                { color: 'bg-pink-400', label: 'Post' },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Day detail panel */}
          <div className="space-y-4">
            {/* Filter */}
            <div className="bg-white rounded-xl border border-gray-100 p-1 flex gap-1">
              {[
                { key: 'all', label: 'Todo' },
                { key: 'tasks', label: 'Tareas' },
                { key: 'meetings', label: 'Reuniones' },
                { key: 'posts', label: 'Posts' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as typeof filter)}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors ${
                    filter === f.key ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Selected day */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-dark text-sm">
                  {selectedDay
                    ? selectedDay.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
                    : 'Seleccioná un día'}
                </h3>
                {selectedEvents.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">
                    {selectedEvents.length}
                  </span>
                )}
              </div>

              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {selectedEvents.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <Circle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Sin eventos este día</p>
                  </div>
                ) : selectedEvents.map((ev, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    {ev.kind === 'task' && (
                      <div>
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_COLOR[ev.data.priority ?? 'normal'] ?? 'bg-blue-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${ev.data.status === 'done' ? 'line-through text-gray-400' : 'text-dark'}`}>
                              {ev.data.title}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{ev.projectName} · {STATUS_LABEL[ev.data.status]}</p>
                            {ev.data.isInternal && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 mt-1 inline-block">Interno</span>
                            )}
                          </div>
                          <CheckSquare className="w-4 h-4 text-gray-300 shrink-0" />
                        </div>
                      </div>
                    )}
                    {ev.kind === 'meeting' && (
                      <div className="flex items-start gap-2">
                        <Video className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-dark">{ev.data.clientName}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(ev.data.startTime)} – {formatTime(ev.data.endTime)}
                          </p>
                          {ev.data.brief && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.data.brief}</p>
                          )}
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                            ev.data.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600'
                            : ev.data.status === 'cancelled' ? 'bg-red-50 text-red-500'
                            : 'bg-amber-50 text-amber-600'
                          }`}>
                            {ev.data.status === 'confirmed' ? 'Confirmada' : ev.data.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    )}
                    {ev.kind === 'post' && (
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-pink-100 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-pink-600">P</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-dark line-clamp-1">{ev.data.caption || '(sin caption)'}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{ev.accountName} · {ev.data.platform} · {ev.data.type}</p>
                          {ev.data.status === 'scheduled' && ev.data.time && (
                            <p className="text-[11px] text-violet-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {ev.data.time}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming meetings */}
            {(settings.meetings ?? []).filter(m => m.status === 'pending' && new Date(m.slotDate) >= today).length > 0 && (
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Reuniones pendientes
                </p>
                <div className="space-y-2">
                  {(settings.meetings ?? [])
                    .filter(m => m.status === 'pending' && new Date(m.slotDate) >= today)
                    .sort((a, b) => a.slotDate.localeCompare(b.slotDate))
                    .slice(0, 3)
                    .map(m => (
                      <div key={m.id} className="bg-white rounded-lg px-3 py-2">
                        <p className="text-sm font-bold text-dark">{m.clientName}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(m.slotDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} · {m.startTime}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
