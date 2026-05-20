import { supabase } from '../lib/supabase';

const BUCKET = 'cm-media';

export type UploadResult = {
  url: string;
  path: string;
};

/** Upload a File to Supabase Storage and return its public URL. */
export async function uploadMediaFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? 'anon';

  const ext = file.name.split('.').pop() ?? 'bin';
  const uniqueName = `${crypto.randomUUID()}.${ext}`;
  const path = `${userId}/${uniqueName}`;

  // Supabase JS v2 doesn't expose upload progress natively,
  // so we use XMLHttpRequest directly to track progress.
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${session?.access_token ?? supabaseKey}`);
    xhr.setRequestHeader('apikey', supabaseKey);
    xhr.setRequestHeader('x-upsert', 'false');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    const formData = new FormData();
    formData.append('', file);
    xhr.send(formData);
  });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Delete a previously uploaded file by its storage path. */
export async function deleteMediaFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn('deleteMediaFile:', error.message);
}

/** Check if a string looks like an external cloud link (Drive, Dropbox, etc.) */
export function isCloudLink(url: string): boolean {
  return (
    url.includes('drive.google.com') ||
    url.includes('dropbox.com') ||
    url.includes('onedrive.live.com') ||
    url.includes('icloud.com') ||
    url.includes('notion.so') ||
    url.includes('figma.com') ||
    url.includes('canva.com')
  );
}

export const ACCEPTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
  doc:   ['application/pdf'],
};

export const ALL_ACCEPTED = [
  ...ACCEPTED_TYPES.image,
  ...ACCEPTED_TYPES.video,
  ...ACCEPTED_TYPES.doc,
].join(',');

export function fileCategory(file: File): 'image' | 'video' | 'doc' | 'other' {
  if (ACCEPTED_TYPES.image.includes(file.type)) return 'image';
  if (ACCEPTED_TYPES.video.includes(file.type)) return 'video';
  if (ACCEPTED_TYPES.doc.includes(file.type)) return 'doc';
  return 'other';
}
