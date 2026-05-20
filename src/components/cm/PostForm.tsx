import React, { useState } from 'react';
import {
  Calendar, Clock, Link, Hash, AlignLeft, Repeat,
  BarChart2, FileImage, AlertTriangle, ThumbsUp, Tag,
} from 'lucide-react';
import type { ContentPost, CMHashtagGroup, PostPriority, ApprovalStatus } from '../../types';
import MediaUploader from '../ui/MediaUploader';
import { ACCEPTED_TYPES } from '../../services/storageService';

const PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'YouTube', 'Pinterest', 'Twitter/X'];

const PRIORITIES: { value: PostPriority; label: string; color: string }[] = [
  { value: 'urgent', label: '🔴 Urgente', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'high',   label: '🟠 Alta',    color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'normal', label: '🟡 Normal',  color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'low',    label: '⚪ Baja',    color: 'text-gray-500 bg-gray-50 border-gray-200' },
];

const APPROVAL_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: 'none',             label: 'Sin aprobación' },
  { value: 'pending_approval', label: 'Enviado al cliente' },
  { value: 'approved',         label: 'Aprobado ✓' },
  { value: 'rejected',         label: 'Rechazado ✗' },
];

const POST_TYPES = [
  { value: 'post',     label: 'Post' },
  { value: 'reel',     label: 'Reel' },
  { value: 'story',    label: 'Story' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'otro',     label: 'Otro' },
] as const;

const STATUS_OPTIONS = [
  { value: 'draft',     label: 'Borrador',   color: 'bg-gray-100 text-gray-600' },
  { value: 'scheduled', label: 'Programado', color: 'bg-amber-100 text-amber-700' },
  { value: 'published', label: 'Publicado',  color: 'bg-emerald-100 text-emerald-700' },
] as const;

const IMAGE_ACCEPT = ACCEPTED_TYPES.image.join(',');
const MEDIA_ACCEPT = [
  ...ACCEPTED_TYPES.image,
  ...ACCEPTED_TYPES.video,
  ...ACCEPTED_TYPES.doc,
].join(',');

interface PostFormProps {
  post?: Partial<ContentPost>;
  hashtagGroups?: CMHashtagGroup[];
  contentPillars?: string[];
  onSave: (post: ContentPost) => void;
  onCancel: () => void;
  defaultDate?: string;
}

const PostForm: React.FC<PostFormProps> = ({
  post,
  hashtagGroups = [],
  contentPillars = [],
  onSave,
  onCancel,
  defaultDate,
}) => {
  const isEditing = Boolean(post?.id);

  const [form, setForm] = useState({
    platforms:           post?.platforms ?? (post?.platform ? [post.platform] : ['Instagram']),
    type:                post?.type ?? 'post',
    date:                post?.date ?? defaultDate ?? new Date().toISOString().split('T')[0],
    time:                post?.time ?? '',
    caption:             post?.caption ?? '',
    contentNote:         post?.contentNote ?? '',
    link:                post?.link ?? '',
    inlineHashtags:      post?.inlineHashtags ?? '',
    hashtagGroupIds:     post?.hashtagGroupIds ?? [],
    contentPillar:       post?.contentPillar ?? '',
    status:              post?.status ?? 'draft',
    priority:            post?.priority ?? 'normal',
    approvalStatus:      post?.approvalStatus ?? 'none',
    isRecurring:         post?.isRecurring ?? false,
    recurringFrequency:  post?.recurringFrequency ?? 'weekly',
    performanceReach:    post?.performanceReach ?? 0,
    performanceLikes:    post?.performanceLikes ?? 0,
    performanceComments: post?.performanceComments ?? 0,
    performanceNotes:    post?.performanceNotes ?? '',
    // Media — stored as arrays of URLs
    coverImage:   post?.coverImage  ? [post.coverImage]  : [] as string[],
    mediaUrls:    post?.mediaUrls   ?? [] as string[],
    inspoLinks:   post?.inspoLinks  ?? [] as string[],
    category:     post?.category    ?? '',
  } as {
    platforms: string[];
    type: typeof POST_TYPES[number]['value'];
    date: string;
    time: string;
    caption: string;
    contentNote: string;
    link: string;
    inlineHashtags: string;
    hashtagGroupIds: string[];
    contentPillar: string;
    status: 'draft' | 'scheduled' | 'published';
    priority: PostPriority;
    approvalStatus: ApprovalStatus;
    isRecurring: boolean;
    recurringFrequency: 'weekly' | 'biweekly' | 'monthly';
    performanceReach: number;
    performanceLikes: number;
    performanceComments: number;
    performanceNotes: string;
    coverImage: string[];
    mediaUrls: string[];
    inspoLinks: string[];
    category: string;
  });

  const [tab, setTab] = useState<'content' | 'media' | 'performance'>('content');

  const togglePlatform = (p: string) =>
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p],
    }));

  const toggleGroup = (id: string) =>
    setForm(prev => ({
      ...prev,
      hashtagGroupIds: prev.hashtagGroupIds.includes(id)
        ? prev.hashtagGroupIds.filter(x => x !== id)
        : [...prev.hashtagGroupIds, id],
    }));

  const handleSave = () => {
    if (!form.caption.trim() || form.platforms.length === 0 || !form.date) return;
    onSave({
      id:                   post?.id ?? crypto.randomUUID(),
      platform:             form.platforms[0],
      platforms:            form.platforms,
      type:                 form.type,
      date:                 form.date,
      time:                 form.time || undefined,
      caption:              form.caption,
      contentNote:          form.contentNote || undefined,
      link:                 form.link || undefined,
      inlineHashtags:       form.inlineHashtags || undefined,
      hashtagGroupIds:      form.hashtagGroupIds.length ? form.hashtagGroupIds : undefined,
      contentPillar:        form.contentPillar || undefined,
      status:               form.status,
      priority:             form.priority,
      approvalStatus:       form.approvalStatus !== 'none' ? form.approvalStatus : undefined,
      isRecurring:          form.isRecurring || undefined,
      recurringFrequency:   form.isRecurring ? form.recurringFrequency : undefined,
      performanceReach:     form.performanceReach || undefined,
      performanceLikes:     form.performanceLikes || undefined,
      performanceComments:  form.performanceComments || undefined,
      performanceNotes:     form.performanceNotes || undefined,
      coverImage:           form.coverImage[0] || undefined,
      mediaUrls:            form.mediaUrls.length ? form.mediaUrls : undefined,
      inspoLinks:           form.inspoLinks.length ? form.inspoLinks : undefined,
      category:             form.category.trim() || undefined,
    });
  };

  const captionLen = form.caption.length;

  return (
    <div className="flex flex-col gap-5 max-h-[80vh] overflow-y-auto pr-1">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([
          { key: 'content',     label: 'Contenido' },
          { key: 'media',       label: 'Multimedia' },
          { key: 'performance', label: 'Performance' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === t.key ? 'bg-white text-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT TAB ── */}
      {tab === 'content' && (
        <>
          {/* Platforms */}
          <div>
            <label className="label">Plataformas *</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${
                    form.platforms.includes(p)
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as typeof form.type }))}
                className="input"
              >
                {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as typeof form.status }))}
                className="input"
              >
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Priority + Approval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Prioridad
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                      form.priority === p.value ? p.color : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> Aprobación
              </label>
              <select
                value={form.approvalStatus}
                onChange={e => setForm(prev => ({ ...prev, approvalStatus: e.target.value as ApprovalStatus }))}
                className="input"
              >
                {APPROVAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Fecha *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Clock className="w-3 h-3" /> Hora de publicación
              </label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label flex items-center gap-1">
              <Tag className="w-3 h-3" /> Categoría
            </label>
            <input
              type="text"
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              placeholder="Ej: Educativo, Promocional, Lifestyle…"
              className="input"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="label flex items-center justify-between">
              <span className="flex items-center gap-1">
                <AlignLeft className="w-3 h-3" /> Caption *
              </span>
              <span className={`font-mono text-[10px] ${captionLen > 2200 ? 'text-red-500' : 'text-gray-400'}`}>
                {captionLen}/2200
              </span>
            </label>
            <textarea
              value={form.caption}
              onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
              rows={4}
              placeholder="Escribí el caption del post…"
              className="input resize-none"
            />
          </div>

          {/* Content note */}
          <div>
            <label className="label flex items-center gap-1">
              <FileImage className="w-3 h-3" /> Descripción del arte / video
            </label>
            <input
              type="text"
              value={form.contentNote}
              onChange={e => setForm(p => ({ ...p, contentNote: e.target.value }))}
              placeholder="Ej: Foto del producto fondo blanco, texto overlay…"
              className="input"
            />
          </div>

          {/* Link al asset */}
          <div>
            <label className="label flex items-center gap-1">
              <Link className="w-3 h-3" /> Link al asset (Canva / Drive)
            </label>
            <input
              type="url"
              value={form.link}
              onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
              placeholder="https://canva.com/…"
              className="input"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="label flex items-center gap-1">
              <Hash className="w-3 h-3" /> Hashtags
            </label>
            {hashtagGroups.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {hashtagGroups.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGroup(g.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      form.hashtagGroupIds.includes(g.id)
                        ? 'border-violet-400 bg-violet-50 text-violet-700 font-bold'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {g.name} ({g.hashtags.length})
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              value={form.inlineHashtags}
              onChange={e => setForm(p => ({ ...p, inlineHashtags: e.target.value }))}
              placeholder="#marca #producto #lifestyle…"
              className="input"
            />
          </div>

          {/* Content pillar */}
          {contentPillars.length > 0 && (
            <div>
              <label className="label">Pilar de contenido</label>
              <div className="flex flex-wrap gap-2">
                {contentPillars.map(pillar => (
                  <button
                    key={pillar}
                    type="button"
                    onClick={() => setForm(p => ({
                      ...p,
                      contentPillar: p.contentPillar === pillar ? '' : pillar,
                    }))}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      form.contentPillar === pillar
                        ? 'border-violet-500 bg-violet-50 text-violet-700 font-bold'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {pillar}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recurring */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl flex-wrap">
            <input
              type="checkbox"
              id="recurring"
              checked={form.isRecurring}
              onChange={e => setForm(p => ({ ...p, isRecurring: e.target.checked }))}
              className="w-4 h-4 accent-violet-500"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-dark flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-violet-500" /> Contenido recurrente
            </label>
            {form.isRecurring && (
              <select
                value={form.recurringFrequency}
                onChange={e => setForm(p => ({
                  ...p,
                  recurringFrequency: e.target.value as typeof form.recurringFrequency,
                }))}
                className="input ml-auto text-xs py-1 w-auto"
              >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
              </select>
            )}
          </div>
        </>
      )}

      {/* ── MEDIA TAB ── */}
      {tab === 'media' && (
        <>
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-700">
            Los archivos se suben a Supabase Storage y se convierten en URLs públicas automáticamente.
            También podés pegar links de Google Drive, Canva o Dropbox.
          </div>

          {/* Cover image */}
          <MediaUploader
            label="🖼 Imagen de portada"
            urls={form.coverImage}
            onChange={urls => setForm(p => ({ ...p, coverImage: urls }))}
            accept={IMAGE_ACCEPT}
            single
          />

          {/* Media files */}
          <MediaUploader
            label="📁 Archivos y medios (imágenes, videos, PDFs)"
            urls={form.mediaUrls}
            onChange={urls => setForm(p => ({ ...p, mediaUrls: urls }))}
            accept={MEDIA_ACCEPT}
            maxItems={20}
          />

          {/* Inspo links */}
          <MediaUploader
            label="✨ Inspiración / Referencias (links externos)"
            urls={form.inspoLinks}
            onChange={urls => setForm(p => ({ ...p, inspoLinks: urls }))}
            accept={MEDIA_ACCEPT}
            maxItems={10}
          />
        </>
      )}

      {/* ── PERFORMANCE TAB ── */}
      {tab === 'performance' && (
        <>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
            Completá estas métricas después de publicar el contenido.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'performanceReach',    label: 'Alcance' },
              { key: 'performanceLikes',    label: 'Likes' },
              { key: 'performanceComments', label: 'Comentarios' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type="number"
                  min={0}
                  value={(form as Record<string, unknown>)[key] as number || ''}
                  onChange={e => setForm(p => ({ ...p, [key]: Number(e.target.value) }))}
                  className="input"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <BarChart2 className="w-3 h-3" /> Notas de performance
            </label>
            <textarea
              value={form.performanceNotes}
              onChange={e => setForm(p => ({ ...p, performanceNotes: e.target.value }))}
              rows={3}
              placeholder="¿Qué funcionó? ¿Qué se puede mejorar?"
              className="input resize-none"
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!form.caption.trim() || form.platforms.length === 0 || !form.date}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isEditing ? 'Guardar cambios' : 'Agregar post'}
        </button>
      </div>
    </div>
  );
};

export default PostForm;
