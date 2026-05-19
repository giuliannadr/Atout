import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react';
import type { ContentPost, CMHashtagGroup } from '../../types';
import Modal from '../ui/Modal';
import PostForm from './PostForm';

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
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({
  posts,
  hashtagGroups = [],
  contentPillars = [],
  accountName,
  onAddPost,
  onUpdatePost,
  onDeletePost,
  filterPlatform,
}) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [postModal, setPostModal] = useState<{ open: boolean; post?: ContentPost; date?: string }>({ open: false });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
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

  const selectedPosts = selectedDay ? (postsByDay[selectedDay] ?? []) : [];

  const handleSavePost = (p: ContentPost) => {
    if (postModal.post?.id) onUpdatePost(p);
    else onAddPost(p);
    setPostModal({ open: false });
  };

  const openNewPost = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setPostModal({ open: true, date: dateStr });
  };

  const openEditPost = (post: ContentPost) => setPostModal({ open: true, post });

  const todayKey = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400" />Borrador</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" />Programado</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" />Publicado</div>
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
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-50" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPosts = postsByDay[day] ?? [];
            const isToday = day === todayKey;
            const isSelected = day === selectedDay;

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`min-h-[80px] border-b border-r border-gray-50 p-1.5 cursor-pointer transition-colors hover:bg-violet-50/50 ${
                  isSelected ? 'bg-violet-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-violet-500 text-white' : 'text-gray-500'
                  }`}>
                    {day}
                  </span>
                  {isSelected && (
                    <button
                      onClick={e => { e.stopPropagation(); openNewPost(day); }}
                      className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center hover:bg-violet-200 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-violet-600" />
                    </button>
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

      {/* Selected day panel */}
      {selectedDay !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-dark">
              {selectedDay} de {MONTHS[month]} — {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''}
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openNewPost(selectedDay)}
                className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar post
              </button>
              <button onClick={() => setSelectedDay(null)} className="text-gray-300 hover:text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedPosts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No hay posts para este día.{' '}
              <button onClick={() => openNewPost(selectedDay)} className="text-violet-600 font-semibold hover:underline">
                Agregar uno
              </button>
            </p>
          ) : (
            <div className="space-y-2">
              {selectedPosts.map(p => {
                const platform = p.platforms?.[0] ?? p.platform;
                const allPlatforms = p.platforms ?? [p.platform];
                return (
                  <div
                    key={p.id}
                    onClick={() => openEditPost(p)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 cursor-pointer transition-all group"
                  >
                    <div className={`w-2 h-full min-h-[16px] rounded-full shrink-0 ${PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.default}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {allPlatforms.map(pl => (
                          <span key={pl} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {pl}
                          </span>
                        ))}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                          {p.type}
                        </span>
                        {p.time && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />{p.time}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${
                          p.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {p.status === 'published' ? 'Publicado' : p.status === 'scheduled' ? 'Programado' : 'Borrador'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{p.caption}</p>
                      {p.contentPillar && (
                        <span className="text-[10px] text-violet-600 font-medium mt-1 block">{p.contentPillar}</span>
                      )}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); onDeletePost(p.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-danger transition-all shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Post modal */}
      <Modal
        isOpen={postModal.open}
        onClose={() => setPostModal({ open: false })}
        title={postModal.post ? 'Editar post' : 'Nuevo post'}
      >
        <PostForm
          post={postModal.post}
          hashtagGroups={hashtagGroups}
          contentPillars={contentPillars}
          defaultDate={postModal.date}
          onSave={handleSavePost}
          onCancel={() => setPostModal({ open: false })}
        />
      </Modal>
    </div>
  );
};

export default ContentCalendar;
