/**
 * Meta Graph API service
 * Supports Instagram Business Account metrics sync.
 * All calls go directly from the browser — no server needed.
 * Requires a User Access Token with:
 *   instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement
 */

const GRAPH = 'https://graph.facebook.com/v20.0';

export interface MetaSyncResult {
  followers: number;
  followersGrowth: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  platform: 'Instagram';
  month: string; // "2025-01"
}

export interface MetaIGAccount {
  id: string;
  username: string;
  pageId: string;
  pageName: string;
}

/** Exchange a short-lived token for a long-lived one (60 days). Requires App ID + App Secret. */
export async function exchangeForLongLivedToken(
  shortToken: string,
  appId: string,
  appSecret: string
): Promise<string> {
  const res = await fetch(
    `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
  );
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message ?? 'Error exchanging token');
  return data.access_token;
}

/** Fetch all Instagram Business Accounts linked to pages the user manages. */
export async function fetchLinkedIGAccounts(accessToken: string): Promise<MetaIGAccount[]> {
  const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token&access_token=${accessToken}`);
  if (!pagesRes.ok) {
    const err = await pagesRes.json();
    throw new Error(err.error?.message ?? 'No se pudo acceder a tus páginas de Facebook');
  }
  const pagesData: { data: { id: string; name: string; access_token: string }[] } = await pagesRes.json();
  if (!pagesData.data?.length) return [];

  const results: MetaIGAccount[] = [];
  await Promise.all(
    pagesData.data.map(async page => {
      try {
        const igRes = await fetch(
          `${GRAPH}/${page.id}?fields=instagram_business_account{id,username}&access_token=${page.access_token}`
        );
        if (!igRes.ok) return;
        const igData = await igRes.json();
        if (igData.instagram_business_account) {
          results.push({
            id: igData.instagram_business_account.id,
            username: igData.instagram_business_account.username ?? igData.instagram_business_account.id,
            pageId: page.id,
            pageName: page.name,
          });
        }
      } catch { /* page might not have an IG account */ }
    })
  );
  return results;
}

/** Sync metrics for a given Instagram Business Account for the current month. */
export async function syncInstagramMetrics(
  accessToken: string,
  instagramAccountId: string,
  previousFollowers = 0
): Promise<MetaSyncResult> {
  const now = new Date();
  const month = now.toISOString().slice(0, 7);

  // 1. Basic account info (followers)
  const accountRes = await fetch(
    `${GRAPH}/${instagramAccountId}?fields=followers_count,media_count&access_token=${accessToken}`
  );
  if (!accountRes.ok) {
    const err = await accountRes.json();
    throw new Error(err.error?.message ?? 'Error al obtener datos de la cuenta de Instagram');
  }
  const accountData = await accountRes.json();
  const followers: number = accountData.followers_count ?? 0;

  // 2. Monthly insights (reach + impressions) — needs instagram_manage_insights
  let reach = 0;
  let impressions = 0;
  try {
    const sinceTs = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
    const untilTs = Math.floor(new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59).getTime() / 1000);
    const insightsRes = await fetch(
      `${GRAPH}/${instagramAccountId}/insights?metric=reach,impressions&period=month&since=${sinceTs}&until=${untilTs}&access_token=${accessToken}`
    );
    if (insightsRes.ok) {
      const insightsData = await insightsRes.json();
      const reachEntry = insightsData.data?.find((m: { name: string }) => m.name === 'reach');
      const impressEntry = insightsData.data?.find((m: { name: string }) => m.name === 'impressions');
      const lastVal = (entry: { values?: { value: number }[] } | undefined) =>
        entry?.values?.length ? entry.values[entry.values.length - 1].value : 0;
      reach = lastVal(reachEntry);
      impressions = lastVal(impressEntry);
    }
  } catch { /* insights permission might be missing */ }

  // 3. Engagement rate from last 10 posts
  let engagementRate = 0;
  try {
    const mediaRes = await fetch(
      `${GRAPH}/${instagramAccountId}/media?fields=like_count,comments_count&limit=10&access_token=${accessToken}`
    );
    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      const media: { like_count?: number; comments_count?: number }[] = mediaData.data ?? [];
      if (media.length > 0 && followers > 0) {
        const totalEng = media.reduce((s, m) => s + (m.like_count ?? 0) + (m.comments_count ?? 0), 0);
        engagementRate = Math.round((totalEng / media.length / followers) * 10000) / 100;
      }
    }
  } catch { /* might fail without media permissions */ }

  return {
    followers,
    followersGrowth: followers - previousFollowers,
    reach,
    impressions,
    engagementRate,
    platform: 'Instagram',
    month,
  };
}

/** Quick check: verify the token is valid and return the user's name. */
export async function validateToken(accessToken: string): Promise<string> {
  const res = await fetch(`${GRAPH}/me?fields=name&access_token=${accessToken}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? 'Token inválido');
  }
  const data = await res.json();
  return data.name ?? 'Usuario desconocido';
}
