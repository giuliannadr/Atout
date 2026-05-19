import { supabase } from '../lib/supabase';
import type { Project } from '../types';

/**
 * Public read for a single project by ID.
 * Relies on the "Public read by project ID" RLS policy in Supabase.
 * The UUID serves as an unguessable share token.
 */
export async function fetchPublicProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('data')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`fetchPublicProject: ${error.message}`);
  return (data?.data as Project) ?? null;
}
