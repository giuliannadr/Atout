import React, { useState } from 'react';
import {
  X, Plus, Edit2, Trash2, ExternalLink, Clock,
  AlertTriangle, Image, Link2, MessageCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { ContentPost, CMHashtagGroup, CalendarComment } from '../../types';
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

const PRIORITY_CFG: Record<string, { label: string; className: string }> = {
  urgent: { label: 'Urgente',  className: 'bg-red-100 text-red-700' },
  high:   { label: 'Alta',     className: 'bg-orange-100 text-orange-700' },
  normal: { label: 'Normal',   className: 'bg-amber-100 text-amber-700' },
  low:    { label: 'Baja',     className: 'bg-gray-100 text-gray-500' },
};

const STATUS_CFG: Record<string, { label: string; className: string }> = {
  draft:     { label: 'Borrador',    className: 'bg-gray-100 text-gray-500' },
  scheduled: { label: 'Programado',  className: 'bg-amber-100 text-amber-700' },
  published: { label: 'Publicado',   className: 'bg-emerald-100 text-emerald-700' },
};

const TYPE_ICONS: Record<string, string> = {
  reel:     '🎬',
  post:     '🖼',
  story:    '⚡',
  carousel: '🎠',
  otro:     '📄',
};

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} de ${MONTHS_ES[m - 1]} ${y}`;
}

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string; // "YYYY-MM-DD"
  posts: ContentPost[];
  comments: CalendarComment[];
  hashtagGroups?: CMHashtagGroup[];
  contentPillars?: string[];
  onAddPost: (post: ContentPost) => void;
  onUpdatePost: (post: ContentPost) => void;
  onDeletePost: (postId: string) => void;
}

interface PostCardProps {
  post: ContentPost;
  onEdit: (post: ContentPost) => void;
  onDelete: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const platforms = post.platforms ?? [post.platform];
  const priority = post.priority ? PRIORITY_CFG[post.priority] : null;
  const statusCfg = STATUS_CFG[post.status] ?? STATUS_CFG.draft;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Cover image */}
      {post.coverImage && (
        <div className="w-full h-36 bg-gray-100 overflow-hidden">
          <img
            src={post.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Top row: platforms + type + time + badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {platforms.map(pl => (
            <span
              key={pl}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[pl] ?? PLATFORM_COLORS.default}`}
            >
              {pl}
            </span>
          ))}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {TYPE_ICONS[post.type]} {post.type}
          </span>
          {post.time && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-auto">
              <Clock className="w-3 h-3" /> {post.time}
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.className}`}>
            {statusCfg.label}
          </span>
          {priority && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${priority.className}`}>
              <AlertTriangle className="w-2.5 h-2.5" /> {priority.label}
            </span>
          )}
        </div>

        {/* Caption */}
        <p className={`text-sm text-gray-700 ${expanded ? '' : 'line-clamp-3'}`}>{post.caption}</p>

        {/* Category + Pillar */}
        <div className="flex flex-wrap gap-2 mt-2">
          {post.category && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
              {post.category}
            </span>
          )}
          {post.contentPillar && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              {post.contentPillar}
            </span>
          )}
        </div>

        {/* Expandable detail */}
        {(post.contentNote || post.link || (post.inspoLinks && post.inspoLinks.length > 0) || (post.mediaUrls && post.mediaUrls.length > 0)) && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-3 flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-700"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}

        {expanded && (
          <div className="mt-3 space-y-3 pt-3 border-t border-gray-50">
            {post.contentNote && (
              <div className="flex items-start gap-2">
                <Image className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Descripción del arte</p>
                  <p className="text-xs text-gray-600">{post.contentNote}</p>
                </div>
              </div>
            )}

            {post.link && (
              <div className="flex items-start gap-2">
                <Link2 className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Asset (Canva/Drive)</p>
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-violet-600 hover:underline flex items-center gap-0.5"
                  >
                    {post.link.length > 50 ? post.link.slice(0, 50) + '...' : post.link}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {post.inspoLinks && post.inspoLinks.length > 0 && (
              <div className="flex items-start gap-2">
                <Link2 className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Inspiración</p>
                  <div className="space-y-0.5">
                    {post.inspoLinks.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-violet-600 hover:underline flex items-center gap-0.5 block"
                      >
                        {url.length > 50 ? url.slice(0, 50) + '...' : url}
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Archivos / Medios</p>
                <div className="flex flex-wrap gap-2">
                  {post.mediaUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-lg flex items-center gap-0.5 transition-colors"
                    >
                      Media {i + 1} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
          <button
            onClick={() => onEdit(post)}
            className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" /> Editar
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  posts,
  comments,
  hashtagGroups = [],
  contentPillars = [],
  onAddPost,
  onUpdatePost,
  onDeletePost,
}) => {
  const [editingPost, setEditingPost] = useState<ContentPost | undefined>(undefined);
  const [postFormOpen, setPostFormOpen] = useState(false);

  if (!isOpen) return null;

  const handleEdit = (post: ContentPost) => {
    setEditingPost(post);
    setPostFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingPost(undefined);
    setPostFormOpen(true);
  };

  const handleSavePost = (post: ContentPost) => {
    if (editingPost?.id) {
      onUpdatePost(post);
    } else {
      onAddPost(post);
    }
    setPostFormOpen(false);
    setEditingPost(undefined);
  };

  const handleDelete = (postId: string) => {
    if (confirm('¿Eliminar este post?')) {
      onDeletePost(postId);
    }
  };

  return (
    <>
      {/* Day detail overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
        <div
          className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:max-w-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Sticky header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0">
            <div>
              <h2 className="text-lg font-black text-dark capitalize">{formatDateLabel(date)}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {posts.length} post{posts.length !== 1 ? 's' : ''}
                {comments.length > 0 && ` · ${comments.length} comentario${comments.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-dark rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Posts */}
            {posts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">No hay posts para este día.</p>
                <button
                  onClick={handleAddNew}
                  className="mt-3 btn-primary bg-violet-600 hover:bg-violet-700 text-sm flex items-center gap-1.5 mx-auto"
                >
                  <Plus className="w-4 h-4" /> Agregar post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* Add post button */}
            {posts.length > 0 && (
              <button
                onClick={handleAddNew}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-violet-600 border-2 border-dashed border-violet-200 hover:border-violet-400 hover:bg-violet-50 py-3 rounded-2xl transition-all"
              >
                <Plus className="w-4 h-4" /> Agregar post a este día
              </button>
            )}

            {/* Comments section */}
            {comments.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-4 h-4 text-violet-500" />
                  <h3 className="font-bold text-dark text-sm">
                    Comentarios del cliente ({comments.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {comments.map(comment => (
                    <div key={comment.id} className="bg-violet-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-violet-700">{comment.authorName}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(comment.createdAt).toLocaleString('es-AR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inner PostForm modal */}
      <Modal
        isOpen={postFormOpen}
        onClose={() => { setPostFormOpen(false); setEditingPost(undefined); }}
        title={editingPost ? 'Editar post' : 'Nuevo post'}
      >
        <PostForm
          post={editingPost}
          hashtagGroups={hashtagGroups}
          contentPillars={contentPillars}
          defaultDate={date}
          onSave={handleSavePost}
          onCancel={() => { setPostFormOpen(false); setEditingPost(undefined); }}
        />
      </Modal>
    </>
  );
};

export default DayDetailModal;
