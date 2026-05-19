import { supabase } from '../lib/supabase';
import type { DevConfig, Plan } from '../types';

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

export interface RedeemResult {
  plan: Plan;
  expiresAt: string;
  message: string;
}

export const SettingsAPI = {
  async fetch(): Promise<DevConfig | null> {
    const userId = await getUserId();
    if (!userId) return null;

    const { data, error } = await withTimeout(
      supabase.from('user_settings').select('data').eq('user_id', userId).maybeSingle(),
      'settings.fetch'
    );

    if (error) throw new Error(`SettingsAPI.fetch: ${error.message}`);
    return (data?.data as DevConfig) ?? null;
  },

  async upsert(settings: DevConfig): Promise<void> {
    const userId = await getUserId();
    if (!userId) return;

    const { error } = await withTimeout(
      supabase.from('user_settings').upsert({
        user_id: userId,
        data: settings,
        updated_at: new Date().toISOString(),
      }),
      'settings.upsert'
    );

    if (error) throw new Error(`SettingsAPI.upsert: ${error.message}`);
  },

  async redeemPromoCode(code: string): Promise<RedeemResult> {
    const { data, error } = await withTimeout(
      supabase.rpc('redeem_promo_code', { p_code: code }),
      'settings.redeemPromoCode'
    );

    if (error) throw new Error(error.message);

    const result = data as { ok: boolean; plan: string; expires_at: string; message: string };
    if (!result.ok) throw new Error(result.message);

    return {
      plan: result.plan as Plan,
      expiresAt: result.expires_at,
      message: result.message,
    };
  },
};
