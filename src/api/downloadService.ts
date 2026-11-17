export interface SeriesDownloadLink {
  label: string;
  url: string;
}

/** One downloadable release from phono.cc files API. */
export interface DownloadFile {
  name: string;
  size: string;
  sizeBytes: number;
  url: string;
  format: string;
  source?: string;
  encoder?: string;
  quality: string;
  language: string;
  isHdr?: boolean;
  messageId?: string;
  channelId?: string | number | null;
}

export interface DownloadResult {
  tmdbId: string;
  type: 'movie' | 'tv';
  categories?: {
    [key: string]: string[];
  };
  filesByQuality?: {
    [quality: string]: DownloadFile[];
  };
  downloadLinks?: SeriesDownloadLink[];
  contentId?: number;
  error?: string;
}

const TELEGRAM_BOT_BASE = 'https://t.me/phonofilmbot?start=';
const SUPABASE_FUNCTIONS =
  'https://suxbqdcnidvdfmkrshem.supabase.co/functions/v1';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const EDGE_TIMEOUT_MS = 9000;
const T4TSA_TIMEOUT_MS = 6000;

const memoryCache = new Map<string, { at: number; value: DownloadResult }>();

const cacheKey = (
  tmdbId: string,
  type: string,
  title?: string,
  imdbId?: string,
  year?: string,
) =>
  `${type}:${tmdbId}:${(title || '').toLowerCase()}:${imdbId || ''}:${year || ''}`;

const readCache = (key: string): DownloadResult | null => {
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.at < CACHE_TTL_MS) return mem.value;

  try {
    const raw = sessionStorage.getItem(`dl-cache:${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; value: DownloadResult };
    if (Date.now() - parsed.at > CACHE_TTL_MS) {
      sessionStorage.removeItem(`dl-cache:${key}`);
      return null;
    }
    memoryCache.set(key, parsed);
    return parsed.value;
  } catch {
    return null;
  }
};

const writeCache = (key: string, value: DownloadResult) => {
  const entry = { at: Date.now(), value };
  memoryCache.set(key, entry);
  try {
    sessionStorage.setItem(`dl-cache:${key}`, JSON.stringify(entry));
  } catch {
    /* quota / private mode */
  }
};

/** Extract every Telegram URL from invite_link text (supports multi-link lines with |). */
export const parseSeriesInviteLinks = (inviteLink: string): SeriesDownloadLink[] => {
  if (!inviteLink || typeof inviteLink !== 'string') return [];

  const urlRegex = /(https?:\/\/(?:t\.me|telegram\.dog|telegram\.me)\/[^\s|]+)/gi;
  const links: SeriesDownloadLink[] = [];

  for (const rawLine of inviteLink.split(/\n+/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const matches = [...line.matchAll(urlRegex)];
    if (matches.length === 0) continue;

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const url = match[1];
      const prevEnd = i > 0 ? (matches[i - 1].index! + matches[i - 1][0].length) : 0;
      let label = line.substring(prevEnd, match.index!).trim();
      label = label.replace(/[-–—:|]+\s*$/g, '').replace(/^[-–—:|]+\s*/g, '').trim();
      if (!label) label = 'Download';
      links.push({ label, url });
    }
  }

  return links;
};

const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/** Fast path: Supabase edge does search + /content/{id}/files server-side (no CORS). */
const fetchViaEdge = async (
  tmdbId: string,
  title?: string,
  imdbId?: string,
  year?: string,
): Promise<DownloadResult> => {
  const params = new URLSearchParams();
  if (tmdbId) params.set('tmdbId', tmdbId);
  if (title) params.set('title', title);
  if (imdbId) params.set('imdbId', imdbId);
  if (year) params.set('year', year);

  const res = await fetch(`${SUPABASE_FUNCTIONS}/phono-download?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`phono-download edge ${res.status}`);
  const json = await res.json();
  if (!json?.success || !json.data) throw new Error(json?.message || 'edge failed');

  return {
    tmdbId,
    type: 'movie',
    categories: json.data.categories || {},
    filesByQuality: json.data.filesByQuality || {},
    contentId: json.data.contentId,
    error: json.data.error,
  };
};

/** CORS-friendly single-request fallback (tmdb_id only). */
const fetchViaT4tsa = async (tmdbId: string): Promise<DownloadResult> => {
  const res = await fetch(`https://api.t4tsa.cc/get-movie/?tmdb_id=${encodeURIComponent(tmdbId)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`t4tsa ${res.status}`);
  const data = await res.json();

  const categories: { [key: string]: string[] } = {};
  const filesByQuality: { [key: string]: DownloadFile[] } = {};

  for (const [quality, rows] of Object.entries(data || {})) {
    if (quality === 'details' || !Array.isArray(rows)) continue;
    for (const row of rows as Array<Record<string, unknown>>) {
      const messageId = row.message_id ?? row.messageId;
      if (messageId == null) continue;
      const url = `${TELEGRAM_BOT_BASE}${messageId}`;
      const name =
        typeof row.file_name === 'string'
          ? row.file_name
          : `Download ${quality}`;
      const sizeBytes = Number(row.file_size || row.file_size_bytes || 0);
      const file: DownloadFile = {
        name,
        size: sizeBytes
          ? sizeBytes >= 1e9
            ? `${(sizeBytes / 1e9).toFixed(1)} GB`
            : `${Math.round(sizeBytes / 1e6)} MB`
          : '',
        sizeBytes,
        url,
        format: quality,
        quality,
        language: 'English',
        messageId: String(messageId),
      };
      if (!categories[quality]) categories[quality] = [];
      categories[quality].push(url);
      if (!filesByQuality[quality]) filesByQuality[quality] = [];
      filesByQuality[quality].push(file);
    }
  }

  const hasAny = Object.values(filesByQuality).some((a) => a.length > 0);
  return {
    tmdbId,
    type: 'movie',
    categories,
    filesByQuality,
    ...(hasAny ? {} : { error: 'No download links available' }),
  };
};

const hasFiles = (r: DownloadResult | null | undefined) =>
  !!r &&
  !!r.filesByQuality &&
  Object.values(r.filesByQuality).some((arr) => arr && arr.length > 0);

/**
 * Movie downloads — optimized:
 * 1) session/memory cache (instant on re-open)
 * 2) race edge phono-download vs t4tsa (first useful wins)
 * 3) never use AllOrigins (was ~20s failures)
 */
export const fetchMovieDownloadLinks = async (
  tmdbId: string,
  title?: string,
  imdbId?: string,
  year?: string,
): Promise<DownloadResult> => {
  const key = cacheKey(tmdbId, 'movie', title, imdbId, year);
  const cached = readCache(key);
  if (cached && (hasFiles(cached) || cached.error)) {
    return cached;
  }

  try {
    const edgePromise = withTimeout(
      fetchViaEdge(tmdbId, title, imdbId, year),
      EDGE_TIMEOUT_MS,
      'edge',
    ).catch((e) => {
      console.warn('phono-download edge failed:', e);
      return null;
    });

    const t4tsaPromise = withTimeout(
      fetchViaT4tsa(tmdbId),
      T4TSA_TIMEOUT_MS,
      't4tsa',
    ).catch((e) => {
      console.warn('t4tsa fallback failed:', e);
      return null;
    });

    // Prefer edge as soon as it returns with files; otherwise take t4tsa.
    const edge = await edgePromise;
    if (hasFiles(edge)) {
      writeCache(key, edge!);
      // Let t4tsa settle in background without blocking UI
      void t4tsaPromise;
      return edge!;
    }

    const t4 = await t4tsaPromise;
    if (hasFiles(t4)) {
      writeCache(key, t4!);
      return t4!;
    }

    // Edge may have returned a soft error (no match) — surface that
    const result: DownloadResult =
      edge ||
      t4 || {
        tmdbId,
        type: 'movie',
        categories: {},
        filesByQuality: {},
        error: 'No download links available',
      };

    writeCache(key, result);
    return result;
  } catch (error) {
    console.error('❌ Movie download error:', error);
    return {
      tmdbId,
      type: 'movie',
      categories: {},
      filesByQuality: {},
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

const fetchSeriesLinksDirect = async (imdbId: string): Promise<SeriesDownloadLink[]> => {
  const formattedImdbId = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
  const directApiUrl = `https://api.t4tsa.cc/get-series/?imdb_id=${formattedImdbId}`;

  const response = await withTimeout(
    fetch(directApiUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }),
    T4TSA_TIMEOUT_MS,
    'series-api',
  );
  if (!response.ok) throw new Error(`Series API status ${response.status}`);
  const data = await response.json();
  if (!data?.invite_link) return [];
  return parseSeriesInviteLinks(data.invite_link);
};

const resolveSeriesImdbId = async (
  tmdbId: string,
  existingImdbId?: string,
): Promise<string | undefined> => {
  if (existingImdbId) {
    return existingImdbId.startsWith('tt') ? existingImdbId : `tt${existingImdbId}`;
  }

  try {
    const TMDB_ACCESS_TOKEN =
      'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
    const response = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/external_ids`, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
    if (!response.ok) return undefined;
    const externalIds = await response.json();
    return externalIds.imdb_id || undefined;
  } catch (error) {
    console.warn('Failed to resolve IMDb ID for series:', error);
    return undefined;
  }
};

export const fetchSeriesDownloadLinks = async (
  tmdbId: string,
  title: string,
  imdbId?: string,
): Promise<DownloadResult> => {
  const key = cacheKey(tmdbId, 'tv', title, imdbId);
  const cached = readCache(key);
  if (cached && ((cached.downloadLinks && cached.downloadLinks.length > 0) || cached.error)) {
    return cached;
  }

  try {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await withTimeout(
        supabase.functions.invoke('fetch-series', {
          body: { tmdbId, title, imdbId },
        }),
        EDGE_TIMEOUT_MS,
        'fetch-series',
      );

      if (!error && data?.success) {
        const links = data.data?.downloadLinks || [];
        const result: DownloadResult = {
          tmdbId,
          type: 'tv',
          downloadLinks: links,
          ...(links.length === 0 ? { error: 'No download links available for this series' } : {}),
        };
        writeCache(key, result);
        return result;
      }
    } catch (edgeError) {
      console.warn('Edge function series fetch failed, falling back:', edgeError);
    }

    const resolvedImdb = await resolveSeriesImdbId(tmdbId, imdbId);
    if (!resolvedImdb) {
      const result: DownloadResult = {
        tmdbId,
        type: 'tv',
        downloadLinks: [],
        error: 'No IMDb ID found for this series — cannot fetch download links',
      };
      writeCache(key, result);
      return result;
    }

    const downloadLinks = await fetchSeriesLinksDirect(resolvedImdb);
    const result: DownloadResult = {
      tmdbId,
      type: 'tv',
      downloadLinks,
      ...(downloadLinks.length === 0
        ? { error: 'No download links available for this series' }
        : {}),
    };
    writeCache(key, result);
    return result;
  } catch (error) {
    console.error('❌ Series download service error:', error);
    return {
      tmdbId,
      type: 'tv',
      downloadLinks: [],
      error: error instanceof Error ? error.message : 'Failed to fetch series download links',
    };
  }
};

export const getDownloadLinks = async (
  tmdbId: string,
  contentType?: 'movie' | 'tv',
  title?: string,
  imdbId?: string,
  year?: string,
): Promise<DownloadResult> => {
  if (contentType === 'tv') {
    return fetchSeriesDownloadLinks(tmdbId, title || 'Unknown Series', imdbId);
  }
  return fetchMovieDownloadLinks(tmdbId, title, imdbId, year);
};
