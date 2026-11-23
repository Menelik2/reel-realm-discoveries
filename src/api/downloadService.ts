import {
  isCorsOrNetworkError,
  isTimeoutError,
  safeFetch,
  userFacingFetchError,
} from '@/utils/networkErrors';

export interface SeriesDownloadLink {
  label: string;
  url: string;
}

/** One downloadable release from phono / t4tsa. */
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
  corsIssue?: boolean;
}

const TELEGRAM_BOT_BASE = 'https://t.me/phonofilmbot?start=';
const SUPABASE_FUNCTIONS =
  'https://suxbqdcnidvdfmkrshem.supabase.co/functions/v1';

/** Only cache successful file lists. */
const CACHE_TTL_MS = 20 * 60 * 1000;
const EDGE_TIMEOUT_MS = 5000;
const T4TSA_TIMEOUT_MS = 8000;

const memoryCache = new Map<string, { at: number; value: DownloadResult }>();

const cacheKey = (
  tmdbId: string,
  type: string,
  title?: string,
  imdbId?: string,
  year?: string,
) =>
  `${type}:${tmdbId}:${(title || '').toLowerCase()}:${imdbId || ''}:${year || ''}`;

const hasFiles = (r: DownloadResult | null | undefined) =>
  !!r &&
  !!r.filesByQuality &&
  Object.values(r.filesByQuality).some((arr) => arr && arr.length > 0);

const hasSeriesLinks = (r: DownloadResult | null | undefined) =>
  !!r && Array.isArray(r.downloadLinks) && r.downloadLinks.length > 0;

const readCache = (key: string): DownloadResult | null => {
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.at < CACHE_TTL_MS && (hasFiles(mem.value) || hasSeriesLinks(mem.value))) {
    return mem.value;
  }

  try {
    const raw = sessionStorage.getItem(`dl-cache:${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; value: DownloadResult };
    if (Date.now() - parsed.at > CACHE_TTL_MS) {
      sessionStorage.removeItem(`dl-cache:${key}`);
      return null;
    }
    // Never restore empty / error-only cache entries
    if (!hasFiles(parsed.value) && !hasSeriesLinks(parsed.value)) {
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
  // Only persist successful results so failed attempts can retry immediately
  if (!hasFiles(value) && !hasSeriesLinks(value)) return;

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

const formatBytes = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${Math.round(bytes / 1e6)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

const classifyCaught = (error: unknown): { corsIssue: boolean; message: string } => {
  const raw = error instanceof Error ? error.message : String(error);
  const corsIssue =
    isCorsOrNetworkError(error) ||
    raw.includes('CORS_OR_NETWORK') ||
    raw.toLowerCase().includes('cors');
  if (corsIssue) {
    return {
      corsIssue: true,
      message:
        'Browser blocked a cross-origin request. Please retry — a backup server will be used.',
    };
  }
  if (isTimeoutError(error)) {
    return {
      corsIssue: false,
      message: 'Request timed out. Check your connection and try again.',
    };
  }
  return {
    corsIssue: false,
    message: userFacingFetchError(error, 'Failed to fetch download links'),
  };
};

/** Supabase edge: phono search + files (optional — may be undeployed). */
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

  const res = await safeFetch(`${SUPABASE_FUNCTIONS}/phono-download?${params.toString()}`, {
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

/**
 * Primary path: api.t4tsa.cc/get-movie (CORS open, single hop by tmdb_id).
 * message_id values are opaque bot tokens (not numeric Telegram ids).
 */
const fetchViaT4tsa = async (tmdbId: string): Promise<DownloadResult> => {
  const res = await safeFetch(
    `https://api.t4tsa.cc/get-movie/?tmdb_id=${encodeURIComponent(tmdbId)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    },
  );

  if (!res.ok) throw new Error(`t4tsa ${res.status}`);
  const data = await res.json();

  const categories: { [key: string]: string[] } = {};
  const filesByQuality: { [key: string]: DownloadFile[] } = {};

  for (const [quality, rows] of Object.entries(data || {})) {
    if (quality === 'details' || !Array.isArray(rows)) continue;

    for (const row of rows as Array<Record<string, unknown>>) {
      const messageId = row.message_id ?? row.messageId;
      if (messageId == null || String(messageId).trim() === '') continue;

      // Prefer explicit download_url when present
      let url: string;
      if (typeof row.download_url === 'string' && /^https?:\/\//i.test(row.download_url)) {
        url = row.download_url.replace('telegram.dog', 't.me');
      } else {
        url = `${TELEGRAM_BOT_BASE}${messageId}`;
      }

      const name =
        typeof row.file_name === 'string' && row.file_name
          ? row.file_name
          : `${(data as { details?: { title?: string } })?.details?.title || 'Download'} ${quality}`;

      const sizeBytes = Number(row.file_size || row.file_size_bytes || 0);
      const lower = name.toLowerCase();
      const formatParts: string[] = [quality];
      if (/x265|hevc/.test(lower)) formatParts.push('x265');
      else if (/x264/.test(lower)) formatParts.push('x264');
      if (/web-?dl/.test(lower)) formatParts.push('WEB-DL');
      else if (/webrip/.test(lower)) formatParts.push('WEBRip');
      else if (/bluray|blu-ray|brrip/.test(lower)) formatParts.push('BluRay');
      if (/\bhdr\b/.test(lower)) formatParts.push('HDR');

      const file: DownloadFile = {
        name,
        size: formatBytes(sizeBytes),
        sizeBytes,
        url,
        format: formatParts.join(' · '),
        quality,
        language: 'English',
        isHdr: /\bhdr\b/i.test(name),
        messageId: String(messageId),
      };

      if (!categories[quality]) categories[quality] = [];
      categories[quality].push(url);
      if (!filesByQuality[quality]) filesByQuality[quality] = [];
      filesByQuality[quality].push(file);
    }
  }

  // Prefer higher quality tabs first is handled in the modal; sort files by size desc
  for (const q of Object.keys(filesByQuality)) {
    filesByQuality[q].sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
  }

  if (!hasFiles({ tmdbId, type: 'movie', filesByQuality })) {
    return {
      tmdbId,
      type: 'movie',
      categories: {},
      filesByQuality: {},
      error: 'No download links available for this title',
    };
  }

  return {
    tmdbId,
    type: 'movie',
    categories,
    filesByQuality,
  };
};

/**
 * Resolve as soon as ANY source returns files (do not wait for a dead edge).
 */
const firstWithFiles = (
  tasks: Array<Promise<DownloadResult | null>>,
): Promise<DownloadResult | null> => {
  return new Promise((resolve) => {
    let pending = tasks.length;
    let lastEmpty: DownloadResult | null = null;
    let settled = false;

    if (pending === 0) {
      resolve(null);
      return;
    }

    for (const task of tasks) {
      task
        .then((result) => {
          if (settled) return;
          if (hasFiles(result)) {
            settled = true;
            resolve(result);
            return;
          }
          if (result) lastEmpty = result;
          pending -= 1;
          if (pending === 0) resolve(lastEmpty);
        })
        .catch(() => {
          if (settled) return;
          pending -= 1;
          if (pending === 0) resolve(lastEmpty);
        });
    }
  });
};

/**
 * Movie downloads:
 * 1) Cache hit with real files
 * 2) Race t4tsa (primary) + edge phono-download — first files win
 */
export const fetchMovieDownloadLinks = async (
  tmdbId: string,
  title?: string,
  imdbId?: string,
  year?: string,
): Promise<DownloadResult> => {
  const key = cacheKey(tmdbId, 'movie', title, imdbId, year);
  const cached = readCache(key);
  if (cached && hasFiles(cached)) return cached;

  let sawCors = false;

  const t4tsaTask = withTimeout(fetchViaT4tsa(tmdbId), T4TSA_TIMEOUT_MS, 't4tsa').catch((e) => {
    const c = classifyCaught(e);
    if (c.corsIssue) sawCors = true;
    console.warn('[download] t4tsa failed:', c.message);
    return null;
  });

  const edgeTask = withTimeout(
    fetchViaEdge(tmdbId, title, imdbId, year),
    EDGE_TIMEOUT_MS,
    'edge',
  ).catch((e) => {
    const c = classifyCaught(e);
    if (c.corsIssue) sawCors = true;
    console.warn('[download] edge failed:', c.message);
    return null;
  });

  // Prefer whichever returns files first (t4tsa is usually faster / more reliable)
  const winner = await firstWithFiles([t4tsaTask, edgeTask]);

  if (winner && hasFiles(winner)) {
    writeCache(key, winner);
    return winner;
  }

  const result: DownloadResult = winner || {
    tmdbId,
    type: 'movie',
    categories: {},
    filesByQuality: {},
    error: sawCors
      ? 'Browser blocked download APIs (CORS/network). Please retry.'
      : 'No download links available for this title',
    corsIssue: sawCors,
  };

  return result;
};

const fetchSeriesLinksDirect = async (imdbId: string): Promise<SeriesDownloadLink[]> => {
  const formattedImdbId = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
  const directApiUrl = `https://api.t4tsa.cc/get-series/?imdb_id=${formattedImdbId}`;

  const response = await withTimeout(
    safeFetch(directApiUrl, {
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
    const response = await safeFetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      },
    );
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
  if (cached && hasSeriesLinks(cached)) return cached;

  try {
    // Edge first (server-side, no CORS)
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
        if (links.length > 0) {
          const result: DownloadResult = {
            tmdbId,
            type: 'tv',
            downloadLinks: links,
          };
          writeCache(key, result);
          return result;
        }
      }
    } catch (edgeError) {
      console.warn('[download] fetch-series edge failed:', edgeError);
    }

    const resolvedImdb = await resolveSeriesImdbId(tmdbId, imdbId);
    if (!resolvedImdb) {
      return {
        tmdbId,
        type: 'tv',
        downloadLinks: [],
        error: 'No IMDb ID found for this series — cannot fetch download links',
      };
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
    console.error('[download] series error:', error);
    const c = classifyCaught(error);
    return {
      tmdbId,
      type: 'tv',
      downloadLinks: [],
      error: c.message,
      corsIssue: c.corsIssue,
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
