import { supabase } from '../lib/supabase';
import type { CalendarComment } from '../types';

export const CalendarCommentsAPI = {
  /** Fetch comments for a project (authenticated — CM side) */
  async fetchForProject(projectId: string): Promise<CalendarComment[]> {
    const { data, error } = await supabase
      .from('calendar_comments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(r => ({
      id: r.id as string,
      projectId: r.project_id as string,
      authorName: r.author_name as string,
      content: r.content as string,
      targetDate: (r.target_date as string | null) ?? undefined,
      createdAt: r.created_at as string,
      isRead: r.is_read as boolean | undefined,
    }));
  },

  /** Add comment (public — client side, no auth required) */
  async addComment(comment: Omit<CalendarComment, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
    const { error } = await supabase.from('calendar_comments').insert({
      project_id: comment.projectId,
      author_name: comment.authorName,
      content: comment.content,
      target_date: comment.targetDate ?? null,
    });
    if (error) throw error;
  },

  /** Mark comments as read (CM side) */
  async markAsRead(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const { error } = await supabase
      .from('calendar_comments')
      .update({ is_read: true })
      .in('id', ids);
    if (error) throw error;
  },
};
