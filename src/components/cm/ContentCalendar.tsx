import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import type { ContentPost, CMHashtagGroup, CalendarComment } from '../../types';
import DayDetailModal from './DayDetailModal';

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

const STATUS_RING: Record<string, string> = {
  draft: 'ring-gray-300',
  scheduled: 'ring-amber-400',
  published: 'ring-emerald-400',
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

interface ContentCalendarProps {
  posts: ContentPost[];
  hashtagGroups?: CMHashtagGroup[];
  contentPillars?: string[];
  accountName?: string;
  onAddPost: (post: ContentPost) => void;
  onUpdatePost: (post: ContentPost) => void;
  onDeletePost: (postId: string) => void;
  filterPlatform?: string;
  comments?: CalendarComment[];
  onOpenShare?: () => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({
  posts,
  hashtagGroups = [],
  contentPillars = [],
  accountName: _accountName,
  onAddPost,
  onUpdatePost,
  onDeletePost,
  filterPlatform,
  comments = [],
  onOpenShare,
}) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
    setDayModalOpen(false);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
    setDayModalOpen(false);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const postsByDay = useMemo(() => {
    const map: Record<number, ContentPost[]> = {};
    posts.forEach(p => {
      const d = new Date(p.date + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (filterPlatform && !p.platforms?.includes(filterPlatform) && p.platform !== filterPlatform) return;
        if (!map[day]) map[day] = [];
        map[day].push(p);
      }
    });
    return map;
  }, [posts, year, month, filterPlatform]);

  /** Comments indexed by day number (only those with targetDate in this month) */
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

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : '';

  const selectedPosts = selectedDay ? (postsByDay[selectedDay] ?? []) : [];
  const selectedComments = selectedDay ? (commentsByDay[selectedDay] ?? []) : [];

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setDayModalOpen(true);
  };

  const todayKey = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null;

  const unreadCount = comments.filter(c => !c.isRead).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h3 className="text-base font-bold text-dark">
            {MONTHS[month]} {year}
          </h3>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400" />Borrador</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" />Programado</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" />Publicado</div>
          </div>
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="relative flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartir
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[80px] border-b border-r border-gray-50" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPosts = postsByDay[day] ?? [];
            const dayComments = commentsByDay[day] ?? [];
            const isToday = day === todayKey;
            const isSelected = day === selectedDay;

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`min-h-[70px] sm:min-h-[80px] border-b border-r border-gray-50 p-1 sm:p-1.5 cursor-pointer transition-colors hover:bg-violet-50/50 ${
                  isSelected ? 'bg-violet-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-violet-500 text-white' : 'text-gray-500'
                  }`}>
                    {day}
                  </span>
                  {dayComments.length > 0 && (
                    <span className="w-3 h-3 rounded-full bg-blue-400 ring-1 ring-white" title={`${dayComments.length} comentario(s)`} />
                  )}
                </div>

                {/* Post dots */}
                <div className="flex flex-wrap gap-0.5">
                  {dayPosts.slice(0, 6).map(p => {
                    const platform = p.platforms?.[0] ?? p.platform;
                    const color = PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.default;
                    const ring = STATUS_RING[p.status] ?? 'ring-gray-300';
                    return (
                      <div
                        key={p.id}
                        title={`${platform}: ${p.caption.slice(0, 40)}...`}
                        className={`w-2.5 h-2.5 rounded-full ${color} ring-1 ${ring}`}
                      />
                    );
                  })}
                  {dayPosts.length > 6 && (
                    <span className="text-[10px] text-gray-400 font-bold">+{dayPosts.length - 6}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail modal */}
      {selectedDay !== null && (
        <DayDetailModal
          isOpen={dayModalOpen}
          onClose={() => { setDayModalOpen(false); setSelectedDay(null); }}
          date={selectedDateStr}
          posts={selectedPosts}
          comments={selectedComments}
          hashtagGroups={hashtagGroups}
          contentPillars={contentPillars}
          onAddPost={onAddPost}
          onUpdatePost={onUpdatePost}
          onDeletePost={onDeletePost}
        />
      )}
    </div>
  );
};

export default ContentCalendar;
