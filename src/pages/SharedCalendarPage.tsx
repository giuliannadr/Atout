import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Send, CheckCircle, Loader2, MessageCircle, X } from 'lucide-react';
import { fetchPublicProject } from '../api/clientView';
import { CalendarCommentsAPI } from '../api/calendarComments';
import type { Project, ContentPost, CalendarComment } from '../types';

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-500',
  TikTok: 'bg-gray-900',
  Facebook: 'bg-blue-600',
  LinkedIn: 'bg-blue-700',
  YouTube: 'bg-red-500',
  Pinterest: 'bg-rose-500',
  'Twitter/X': 'bg-sky-500',
  default: 'bg-violet-500',
};

const STATUS_CFG: Record<string, { label: string; className: string }> = {
  draft:     { label: 'Borrador',   className: 'bg-gray-100 text-gray-500' },
  scheduled: { label: 'Programado', className: 'bg-amber-100 text-amber-700' },
  published: { label: 'Publicado',  className: 'bg-emerald-100 text-emerald-700' },
};

const TYPE_ICONS: Record<string, string> = {
  reel: '🎬', post: '🖼', story: '⚡', carousel: '🎠', otro: '📄',
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isMonthAllowed(year: number, month: number, sharedMonths: string[] | 'all'): boolean {
  if (sharedMonths === 'all') return true;
  const key = `${year}-${String(month + 1).padStart(2, '0')}`;
  return (sharedMonths as string[]).includes(key);
}

interface CommentFormProps {
  projectId: string;
  targetDate?: string; // undefined = general comment
  onSuccess: (comment: CalendarComment) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ projectId, targetDate, onSuccess }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await CalendarCommentsAPI.addComment({
        projectId,
        authorName: name.trim(),
        content: message.trim(),
        targetDate,
      });
      const newComment: CalendarComment = {
        id: crypto.randomUUID(),
        projectId,
        authorName: name.trim(),
        content: message.trim(),
        targetDate,
        createdAt: new Date().toISOString(),
      };
      onSuccess(newComment);
      setSuccess(true);
      setName('');
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('No se pudo enviar el comentario. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3 text-sm font-medium">
        <CheckCircle className="w-4 h-4" /> ¡Comentario enviado! Gracias.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">Tu nombre *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: María García"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 transition-colors"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">Mensaje *</label>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={targetDate ? 'Tu comentario sobre este día...' : 'Tu comentario general...'}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 transition-colors"
            required
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !name.trim() || !message.trim()}
        className="flex items-center gap-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-4 py-2 rounded-xl transition-colors"
      >
        {submitting
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Send className="w-4 h-4" />}
        {submitting ? 'Enviando...' : 'Enviar comentario'}
      </button>
    </form>
  );
};

interface DayPanelProps {
  date: string;
  posts: ContentPost[];
  dayComments: CalendarComment[];
  projectId: string;
  onClose: () => void;
  onCommentAdded: (c: CalendarComment) => void;
}

const DayPanel: React.FC<DayPanelProps> = ({ date, posts, dayComments, projectId, onClose, onCommentAdded }) => {
  const [y, m, d] = date.split('-').map(Number);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-dark">
          {d} de {MONTHS_ES[m - 1]} {y}
        </h3>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Sin publicaciones para este día.</p>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const platforms = post.platforms ?? [post.platform];
            const statusCfg = STATUS_CFG[post.status] ?? STATUS_CFG.draft;
            return (
              <div key={post.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {platforms.map(pl => (
                    <span key={pl} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {pl}
                    </span>
                  ))}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {TYPE_ICONS[post.type]} {post.type}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                </div>
                {post.coverImage && (
                  <img src={post.coverImage} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
                )}
                <p className="text-sm text-gray-700">{post.caption}</p>
                {post.contentNote && (
                  <p className="text-xs text-gray-400 italic">{post.contentNote}</p>
                )}
                {post.category && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 inline-block">
                    {post.category}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Day comments */}
      {dayComments.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Comentarios de este día</p>
          <div className="space-y-2">
            {dayComments.map(c => (
              <div key={c.id} className="bg-violet-50 rounded-xl px-3 py-2 text-xs">
                <span className="font-bold text-violet-700">{c.authorName}:</span>{' '}
                <span className="text-gray-700">{c.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment form for this day */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-3.5 h-3.5 text-violet-500" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Dejar comentario para este día</p>
        </div>
        <CommentForm projectId={projectId} targetDate={date} onSuccess={onCommentAdded} />
      </div>
    </div>
  );
};

const SharedCalendarPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CalendarComment[]>([]);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    fetchPublicProject(projectId)
      .then(p => {
        setProject(p);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el calendario.');
        setLoading(false);
      });
  }, [projectId]);

  const share = project?.cmCalendarShare;

  const allowedCurrentMonth = share
    ? isMonthAllowed(year, month, share.sharedMonths)
    : false;

  const posts = useMemo<ContentPost[]>(() => project?.contentPosts ?? [], [project]);

  const postsByDay = useMemo(() => {
    const map: Record<number, ContentPost[]> = {};
    posts.forEach(p => {
      const d = new Date(p.date + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(p);
      }
    });
    return map;
  }, [posts, year, month]);

  const commentsByDay = useMemo(() => {
    const map: Record<number, CalendarComment[]> = {};
    comments.forEach(c => {
      if (!c.targetDate) return;
      const d = new Date(c.targetDate + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(c);
      }
    });
    return map;
  }, [comments, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const todayKey = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null;

  const handleCommentAdded = (c: CalendarComment) => setComments(prev => [c, ...prev]);

  const prevMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    if (share && !isMonthAllowed(newYear, newMonth, share.sharedMonths)) return;
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    if (share && !isMonthAllowed(newYear, newMonth, share.sharedMonths)) return;
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDate(null);
  };

  // ── Render states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-2xl">📅</p>
          <p className="text-lg font-bold text-dark">Calendario no encontrado</p>
          <p className="text-sm text-gray-400">{error ?? 'Este enlace no es válido.'}</p>
        </div>
      </div>
    );
  }

  if (!share?.enabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-2xl">🔒</p>
          <p className="text-lg font-bold text-dark">Calendario no disponible</p>
          <p className="text-sm text-gray-400">
            El calendario de este cliente no está activado actualmente.
          </p>
        </div>
      </div>
    );
  }

  if (!allowedCurrentMonth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-2xl">📅</p>
          <p className="text-lg font-bold text-dark">Mes no disponible</p>
          <p className="text-sm text-gray-400">Este mes no está habilitado en el calendario compartido.</p>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={prevMonth} className="text-sm text-violet-600 font-bold hover:underline">← Mes anterior</button>
            <button onClick={nextMonth} className="text-sm text-violet-600 font-bold hover:underline">Mes siguiente →</button>
          </div>
        </div>
      </div>
    );
  }

  const selectedPosts = selectedDate
    ? posts.filter(p => p.date === selectedDate)
    : [];
  const selectedDayNum = selectedDate ? parseInt(selectedDate.split('-')[2], 10) : null;
  const selectedDayComments = selectedDayNum !== null ? (commentsByDay[selectedDayNum] ?? []) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Branding header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <div>
              <p className="text-sm font-black text-dark">Atout</p>
              {share.clientName && (
                <p className="text-[11px] text-gray-400">Calendario de {share.clientName}</p>
              )}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
            Vista cliente
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* General comment form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-violet-500" />
            <h2 className="font-bold text-dark text-sm">Dejar un comentario general</h2>
          </div>
          <CommentForm projectId={projectId!} onSuccess={handleCommentAdded} />
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h3 className="text-base font-bold text-dark">
              {MONTHS_ES[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100 flex-wrap text-xs text-gray-400">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400" />Borrador</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" />Programado</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" />Publicado</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" />Comentario</div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {WEEKDAYS.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[60px] border-b border-r border-gray-50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayPosts = postsByDay[day] ?? [];
              const dayComs = commentsByDay[day] ?? [];
              const ds = dateStr(year, month, day);
              const isToday = day === todayKey;
              const isSelected = ds === selectedDate;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : ds)}
                  className={`min-h-[60px] border-b border-r border-gray-50 p-1 cursor-pointer transition-colors hover:bg-violet-50/50 ${
                    isSelected ? 'bg-violet-50' : ''
                  }`}
                >
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                    isToday ? 'bg-violet-500 text-white' : 'text-gray-500'
                  }`}>
                    {day}
                  </span>
                  <div className="flex flex-wrap gap-0.5">
                    {dayPosts.slice(0, 4).map(p => {
                      const platform = p.platforms?.[0] ?? p.platform;
                      const color = PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.default;
                      return (
                        <div
                          key={p.id}
                          className={`w-2 h-2 rounded-full ${color}`}
                        />
                      );
                    })}
                    {dayPosts.length > 4 && (
                      <span className="text-[9px] text-gray-400 font-bold">+{dayPosts.length - 4}</span>
                    )}
                    {dayComs.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDate && (
          <DayPanel
            date={selectedDate}
            posts={selectedPosts}
            dayComments={selectedDayComments}
            projectId={projectId!}
            onClose={() => setSelectedDate(null)}
            onCommentAdded={handleCommentAdded}
          />
        )}

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-300 pb-4">
          Powered by <span className="font-bold text-violet-400">Atout</span> · Gestión de contenido
        </p>
      </main>
    </div>
  );
};

export default SharedCalendarPage;
