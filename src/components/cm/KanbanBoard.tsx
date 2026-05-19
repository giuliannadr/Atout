import React, { useState } from 'react';
import { Plus, Clock, Repeat, BarChart2, X, ChevronRight } from 'lucide-react';
import type { ContentPost, CMHashtagGroup } from '../../types';
import Modal from '../ui/Modal';
import PostForm from './PostForm';

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-700',
  TikTok: 'bg-gray-900 text-white',
  Facebook: 'bg-blue-100 text-blue-700',
  LinkedIn: 'bg-blue-700 text-white',
  YouTube: 'bg-red-100 text-red-700',
  Pinterest: 'bg-rose-100 text-rose-700',
  'Twitter/X': 'bg-sky-100 text-sky-700',
  default: 'bg-gray-100 text-gray-600',
};

const TYPE_ICONS: Record<string, string> = {
  reel: '🎬',
  post: '🖼',
  story: '⚡',
  carousel: '🎠',
  otro: '📄',
};

const COLUMNS = [
  { key: 'draft',     label: 'Borrador',    color: 'text-gray-500',   bg: 'bg-gray-50',    dot: 'bg-gray-400'    },
  { key: 'scheduled', label: 'Programado',  color: 'text-amber-600',  bg: 'bg-amber-50',   dot: 'bg-amber-400'   },
  { key: 'published', label: 'Publicado',   color: 'text-emerald-600',bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
] as const;

interface KanbanBoardProps {
  posts: ContentPost[];
  hashtagGroups?: CMHashtagGroup[];
  contentPillars?: string[];
  accountName?: string;
  onAddPost: (post: ContentPost) => void;
  onUpdatePost: (post: ContentPost) => void;
  onDeletePost: (postId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  posts,
  hashtagGroups = [],
  contentPillars = [],
  onAddPost,
  onUpdatePost,
  onDeletePost,
}) => {
  const [postModal, setPostModal] = useState<{ open: boolean; post?: ContentPost; defaultStatus?: ContentPost['status'] }>({ open: false });

  const byStatus = (status: ContentPost['status']) =>
    posts
      .filter(p => p.status === status)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const movePost = (post: ContentPost, newStatus: ContentPost['status']) => {
    onUpdatePost({ ...post, status: newStatus });
  };

  const handleSave = (p: ContentPost) => {
    if (postModal.post?.id) onUpdatePost(p);
    else onAddPost(p);
    setPostModal({ open: false });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pipeline de contenido</h3>
        <button
          onClick={() => setPostModal({ open: true })}
          className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colPosts = byStatus(col.key);
          return (
            <div key={col.key} className={`rounded-2xl ${col.bg} p-4`}>
              {/* Column header */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white ${col.color}`}>
                  {colPosts.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[120px]">
                {colPosts.map(post => {
                  const platform = post.platforms?.[0] ?? post.platform;
                  const allPlatforms = post.platforms ?? [post.platform];
                  const platformStyle = PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.default;

                  return (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex flex-wrap gap-1">
                          {allPlatforms.slice(0, 2).map(pl => (
                            <span key={pl} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[pl] ?? PLATFORM_COLORS.default}`}>
                              {pl}
                            </span>
                          ))}
                          {allPlatforms.length > 2 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              +{allPlatforms.length - 2}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onDeletePost(post.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-danger transition-all shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Type + caption */}
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-base" title={post.type}>{TYPE_ICONS[post.type] ?? '📄'}</span>
                        <p
                          className="text-xs text-dark font-medium line-clamp-2 flex-1 cursor-pointer hover:text-violet-700"
                          onClick={() => setPostModal({ open: true, post })}
                        >
                          {post.caption || <span className="text-gray-400 italic">Sin caption</span>}
                        </p>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatDate(post.date)}</span>
                          {post.time && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />{post.time}
                            </span>
                          )}
                          {post.isRecurring && <Repeat className="w-2.5 h-2.5 text-violet-400" />}
                          {post.performanceReach && (
                            <span className="flex items-center gap-0.5 text-emerald-600">
                              <BarChart2 className="w-2.5 h-2.5" />{post.performanceReach.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {post.contentPillar && (
                        <div className="mt-2">
                          <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                            {post.contentPillar}
                          </span>
                        </div>
                      )}

                      {/* Move buttons */}
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        {COLUMNS.filter(c => c.key !== col.key).map(target => (
                          <button
                            key={target.key}
                            onClick={() => movePost(post, target.key)}
                            className={`flex-1 text-[10px] font-bold py-1 rounded-lg flex items-center justify-center gap-0.5 transition-colors ${
                              target.key === 'published'
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : target.key === 'scheduled'
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <ChevronRight className="w-2.5 h-2.5" />
                            {target.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Add button */}
                <button
                  onClick={() => setPostModal({ open: true, defaultStatus: col.key })}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={postModal.open}
        onClose={() => setPostModal({ open: false })}
        title={postModal.post ? 'Editar post' : 'Nuevo post'}
      >
        <PostForm
          post={postModal.post ?? (postModal.defaultStatus ? { status: postModal.defaultStatus } : undefined)}
          hashtagGroups={hashtagGroups}
          contentPillars={contentPillars}
          onSave={handleSave}
          onCancel={() => setPostModal({ open: false })}
        />
      </Modal>
    </div>
  );
};

export default KanbanBoard;
