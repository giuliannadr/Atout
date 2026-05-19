import { supabase } from '../lib/supabase';
import type { Project } from '../types';

const TIMEOUT_MS = 12_000;

function withTimeout<T>(query: PromiseLike<T>, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${label}: sin respuesta después de ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS)
  );
  return Promise.race([Promise.resolve(query), timeout]);
}

async function getUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export const ProjectsAPI = {
  async fetchAll(): Promise<Project[]> {
    const userId = await getUserId();
    if (!userId) return [];

    const query = supabase
      .from('projects')
      .select('data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data, error } = await withTimeout(query, 'fetchAll');
    if (error) throw new Error(`ProjectsAPI.fetchAll: ${error.message}`);
    return (data ?? []).map((row: { data: Project }) => row.data);
  },

  async upsert(project: Project): Promise<void> {
    const userId = await getUserId();
    if (!userId) return;

    const { error } = await withTimeout(
      supabase.from('projects').upsert({
        id: project.id,
        user_id: userId,
        data: project,
        updated_at: new Date().toISOString(),
      }),
      'upsert'
    );

    if (error) throw new Error(`ProjectsAPI.upsert: ${error.message}`);
  },

  async remove(id: string): Promise<void> {
    const userId = await getUserId();
    if (!userId) return;

    const { error } = await withTimeout(
      supabase.from('projects').delete().eq('id', id).eq('user_id', userId),
      'remove'
    );

    if (error) throw new Error(`ProjectsAPI.remove: ${error.message}`);
  },
};
