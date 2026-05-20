import React, { useRef, useState, useCallback } from 'react';
import {
  Upload, X, ExternalLink, Image as ImageIcon,
  Film, FileText, Link as LinkIcon, Loader2, CheckCircle2,
} from 'lucide-react';
import {
  uploadMediaFile,
  fileCategory,
  ALL_ACCEPTED,
  isCloudLink,
} from '../../services/storageService';

interface UploadedItem {
  id: string;
  url: string;
  name: string;
  kind: 'image' | 'video' | 'doc' | 'link';
}

interface MediaUploaderProps {
  /** Current list of URLs (public storage URLs or cloud links) */
  urls: string[];
  /** Called with the updated url list after add/remove */
  onChange: (urls: string[]) => void;
  /** Max number of items allowed */
  maxItems?: number;
  /** Accepts image, video, doc — default all */
  accept?: string;
  /** Label shown above the zone */
  label?: string;
  /** If true only allow 1 item (for cover image) */
  single?: boolean;
}

function kindOf(url: string): UploadedItem['kind'] {
  if (isCloudLink(url)) return 'link';
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)) return 'image';
  if (/\.(mp4|mov|avi|webm)(\?|$)/i.test(url)) return 'video';
  if (/\.pdf(\?|$)/i.test(url)) return 'doc';
  return 'image'; // default for supabase storage images
}

function nameOf(url: string): string {
  try {
    const parts = new URL(url).pathname.split('/');
    return decodeURIComponent(parts[parts.length - 1] || url);
  } catch {
    return url;
  }
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  urls,
  onChange,
  maxItems = 10,
  accept = ALL_ACCEPTED,
  label,
  single = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const items: UploadedItem[] = urls.map(url => ({
    id: url,
    url,
    name: nameOf(url),
    kind: kindOf(url),
  }));

  const canAdd = single ? items.length === 0 : items.length < maxItems;

  const addUrl = useCallback((url: string) => {
    if (!url || urls.includes(url)) return;
    if (single) onChange([url]);
    else onChange([...urls, url]);
  }, [urls, onChange, single]);

  const removeUrl = useCallback((url: string) => {
    onChange(urls.filter(u => u !== url));
  }, [urls, onChange]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    setProgress(0);

    const toUpload = Array.from(files).slice(0, single ? 1 : maxItems - urls.length);

    try {
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        if (file.size > 100 * 1024 * 1024) {
          setError(`"${file.name}" supera el límite de 100 MB`);
          continue;
        }
        const result = await uploadMediaFile(file, (pct) => {
          setProgress(Math.round(((i / toUpload.length) + pct / 100 / toUpload.length) * 100));
        });
        addUrl(result.url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir el archivo';
      setError(msg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [addUrl, maxItems, single, urls.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleLinkAdd = () => {
    const url = linkInput.trim();
    if (!url) return;
    const isHttp = url.startsWith('http://') || url.startsWith('https://');
    if (!isHttp) { setError('Ingresá una URL válida (https://...)'); return; }
    addUrl(url);
    setLinkInput('');
    setShowLinkInput(false);
    setError(null);
  };

  return (
    <div className="space-y-2">
      {label && <label className="label">{label}</label>}

      {/* Uploaded items */}
      {items.length > 0 && (
        <div className={`grid gap-2 ${single ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {items.map(item => (
            <div
              key={item.id}
              className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
              style={{ aspectRatio: single ? '16/9' : '1' }}
            >
              {item.kind === 'image' ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : item.kind === 'video' ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400">
                  <Film className="w-8 h-8" />
                  <span className="text-[10px] text-center px-2 truncate w-full">{item.name}</span>
                </div>
              ) : item.kind === 'doc' ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400">
                  <FileText className="w-8 h-8" />
                  <span className="text-[10px] text-center px-2 truncate w-full">{item.name}</span>
                </div>
              ) : (
                /* cloud link */
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-violet-400 px-2">
                  <LinkIcon className="w-6 h-6" />
                  <span className="text-[10px] text-center truncate w-full">{item.name}</span>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => removeUrl(item.url)}
                  className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone — only show if can add more */}
      {canAdd && (
        <>
          {/* Progress bar */}
          {uploading && (
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-violet-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragEnter={e => { e.preventDefault(); setDragging(true); }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl transition-colors cursor-pointer
              flex flex-col items-center justify-center gap-2 py-5 px-4 text-center
              ${dragging ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/40'}
              ${uploading ? 'pointer-events-none opacity-60' : ''}`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                <span className="text-xs text-violet-600 font-medium">Subiendo… {progress}%</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-gray-600">
                    Arrastrá archivos o <span className="text-violet-600">buscá en tu dispositivo</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Imágenes, videos, PDF · Máx 100 MB
                  </p>
                </div>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={!single}
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {/* Cloud link button */}
          {!showLinkInput ? (
            <button
              type="button"
              onClick={() => setShowLinkInput(true)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors font-medium"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Agregar link (Google Drive, Canva, Dropbox…)
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLinkAdd()}
                placeholder="https://drive.google.com/..."
                className="input text-xs py-2 flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={handleLinkAdd}
                className="btn-primary text-xs py-2 px-3"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => { setShowLinkInput(false); setLinkInput(''); }}
                className="btn-secondary text-xs py-2 px-3"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Single-mode replacement button */}
      {single && items.length > 0 && (
        <button
          type="button"
          onClick={() => { removeUrl(items[0].url); }}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Quitar imagen de portada
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}

      {/* Cloud icons legend */}
      {!uploading && canAdd && (
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { icon: ImageIcon, label: 'Imagen' },
            { icon: Film, label: 'Video' },
            { icon: FileText, label: 'PDF' },
            { icon: LinkIcon, label: 'Drive / Canva' },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1 text-[10px] text-gray-400">
              <Icon className="w-3 h-3" /> {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
