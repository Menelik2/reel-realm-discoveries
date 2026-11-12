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
  /** Quality → Telegram URL list (legacy shape for modal tabs). */
  categories?: {
    [key: string]: string[];
  };
  /** Quality → rich file rows (preferred by DownloadModal). */
  filesByQuality?: {
    [quality: string]: DownloadFile[];
  };
  downloadLinks?: SeriesDownloadLink[];
  contentId?: number;
  error?: string;
}

const PHONO_API = 'https://phono.cc/svc/api';
const TELEGRAM_BOT_BASE = 'https://t.me/phonofilmbot?start=';

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

const formatBytes = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  const digits = i === 0 ? 0 : i <= 2 ? 0 : 1;
  return `${n.toFixed(digits)} ${units[i]}`;
};

/** Fetch JSON from phono.cc; falls back to AllOrigins when CORS blocks the browser. */
const fetchPhonoJson = async <T,>(pathOrUrl: string): Promise<T> => {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${PHONO_API}${pathOrUrl}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Phono API ${res.status}`);
    return (await res.json()) as T;
  } catch (directErr) {
    console.warn('Direct phono fetch failed, trying proxy:', directErr);
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Proxy ${res.status}`);
    const body = await res.json();
    if (!body?.contents) throw new Error('Empty proxy response');
    return JSON.parse(body.contents) as T;
  }
};

interface PhonoSearchHit {
  content_id: number;
  content_type: string;
  title: string;
  release_date?: string | null;
  imdb_id?: string | null;
  alternative_titles?: string[];
}

interface PhonoSearchResponse {
  results?: PhonoSearchHit[];
  count?: number;
}

interface PhonoFileRow {
  id?: number;
  content_id?: number;
  file_name?: string;
  file_size_bytes?: number;
  source?: string | null;
  encoder_name?: string | null;
  resolution_label?: string | null;
  channel_id?: number | null;
  message_id?: number | string | null;
  is_hdr?: boolean;
  download_url?: string | null;
  languages?: string[];
}

/** language → resolution → files */
type PhonoFilesResponse = Record<string, Record<string, PhonoFileRow[]>>;

const normalizeTitle = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const pickBestContent = (
  hits: PhonoSearchHit[],
  title: string,
  year?: string,
  imdbId?: string,
): PhonoSearchHit | null => {
  const movies = hits.filter((h) => (h.content_type || '').toUpperCase() === 'MOVIE');
  const pool = movies.length > 0 ? movies : hits;
  if (pool.length === 0) return null;

  if (imdbId) {
    const want = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
    const byImdb = pool.find((h) => h.imdb_id === want);
    if (byImdb) return byImdb;
  }

  const target = normalizeTitle(title);
  let best: PhonoSearchHit | null = null;
  let bestScore = -1;

  for (const hit of pool) {
    const names = [hit.title, ...(hit.alternative_titles || [])].map(normalizeTitle);
    let score = 0;
    if (names.some((n) => n === target)) score += 100;
    else if (names.some((n) => n.includes(target) || target.includes(n))) score += 40;

    const hitYear = hit.release_date?.slice(0, 4);
    if (year && hitYear) {
      if (hitYear === year) score += 50;
      else if (Math.abs(Number(hitYear) - Number(year)) <= 1) score += 15;
      else score -= 20;
    }

    if (score > bestScore) {
      bestScore = score;
      best = hit;
    }
  }

  return bestScore >= 40 ? best : pool[0];
};

const resolveTelegramUrl = (file: PhonoFileRow): string | null => {
  if (file.download_url && /^https?:\/\//i.test(file.download_url)) {
    return file.download_url.replace('telegram.dog', 't.me');
  }
  if (file.message_id != null && String(file.message_id).length > 0) {
    // Opaque tokens (e.g. 23RSL…) and numeric ids both work as ?start=
    return `${TELEGRAM_BOT_BASE}${file.message_id}`;
  }
  return null;
};

const buildFormatLabel = (file: PhonoFileRow): string => {
  const parts: string[] = [];
  if (file.source) parts.push(String(file.source));
  if (file.encoder_name) parts.push(String(file.encoder_name));
  if (file.is_hdr) parts.push('HDR');
  if (file.file_name) {
    const lower = file.file_name.toLowerCase();
    if (/\bx265\b|hevc/i.test(lower)) parts.push('x265');
    else if (/\bx264\b/i.test(lower)) parts.push('x264');
    if (/\bweb-?dl\b/i.test(lower)) parts.push('WEB-DL');
    else if (/\bwebrip\b/i.test(lower)) parts.push('WEBRip');
    else if (/\bbluray\b|blu-ray/i.test(lower)) parts.push('BluRay');
  }
  // de-dupe while preserving order
  return [...new Set(parts)].join(' · ') || 'Video';
};

/**
 * Movie downloads via:
 *   1) GET https://phono.cc/svc/api/search?q={title}
 *   2) GET https://phono.cc/svc/api/content/{content_id}/files
 */
export const fetchMovieDownloadLinks = async (
  tmdbId: string,
  title?: string,
  imdbId?: string,
  year?: string,
): Promise<DownloadResult> => {
  try {
    const query = (title && title.trim()) || `tmdb ${tmdbId}`;
    console.log('🔍 Phono search for movie downloads:', query);

    const search = await fetchPhonoJson<PhonoSearchResponse>(
      `/search?q=${encodeURIComponent(query)}`,
    );
    const hits = search.results || [];
    if (hits.length === 0) {
      return {
        tmdbId,
        type: 'movie',
        categories: {},
        filesByQuality: {},
        error: 'No matching content found on Phono',
      };
    }

    const best = pickBestContent(hits, title || '', year, imdbId);
    if (!best?.content_id) {
      return {
        tmdbId,
        type: 'movie',
        categories: {},
        filesByQuality: {},
        error: 'Could not resolve Phono content id',
      };
    }

    console.log('📦 Phono content_id:', best.content_id, best.title);

    // Method requested: https://phono.cc/svc/api/content/{id}/files
    const filesPayload = await fetchPhonoJson<PhonoFilesResponse>(
      `/content/${best.content_id}/files`,
    );

    const categories: { [key: string]: string[] } = {};
    const filesByQuality: { [key: string]: DownloadFile[] } = {};

    // Prefer English group first, then remaining languages
    const langKeys = Object.keys(filesPayload || {});
    langKeys.sort((a, b) => {
      if (a === 'English') return -1;
      if (b === 'English') return 1;
      return a.localeCompare(b);
    });

    for (const language of langKeys) {
      const byRes = filesPayload[language] || {};
      for (const [quality, rows] of Object.entries(byRes)) {
        if (!Array.isArray(rows)) continue;
        for (const row of rows) {
          const url = resolveTelegramUrl(row);
          if (!url) continue;

          const name = row.file_name || `${best.title} ${quality}`;
          const sizeBytes = row.file_size_bytes || 0;
          const file: DownloadFile = {
            name,
            size: formatBytes(sizeBytes),
            sizeBytes,
            url,
            format: buildFormatLabel(row),
            source: row.source || undefined,
            encoder: row.encoder_name || undefined,
            quality: row.resolution_label || quality,
            language,
            isHdr: !!row.is_hdr,
            messageId: row.message_id != null ? String(row.message_id) : undefined,
            channelId: row.channel_id ?? null,
          };

          if (!filesByQuality[quality]) filesByQuality[quality] = [];
          filesByQuality[quality].push(file);

          if (!categories[quality]) categories[quality] = [];
          categories[quality].push(url);
        }
      }
    }

    // Stable quality order for UI
    const preferred = ['2160p', '1440p', '1080p', '720p', '480p', '360p'];
    for (const q of preferred) {
      if (filesByQuality[q]) {
        filesByQuality[q].sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
      }
    }

    const hasAny = Object.values(filesByQuality).some((arr) => arr.length > 0);
    if (!hasAny) {
      return {
        tmdbId,
        type: 'movie',
        categories,
        filesByQuality,
        contentId: best.content_id,
        error: 'No downloadable files for this title',
      };
    }

    return {
      tmdbId,
      type: 'movie',
      categories,
      filesByQuality,
      contentId: best.content_id,
    };
  } catch (error) {
    console.error('❌ Phono movie download error:', error);
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

  let data: { success?: boolean; invite_link?: string; message?: string };

  try {
    const response = await fetch(directApiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Series API status ${response.status}`);
    }
    data = await response.json();
  } catch (directError) {
    console.log('Direct series API failed, trying AllOrigins proxy:', directError);
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(directApiUrl)}`;
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Proxy series API status ${response.status}`);
    }
    const responseData = await response.json();
    if (!responseData.contents) {
      throw new Error('No contents in proxy response');
    }
    data = JSON.parse(responseData.contents);
  }

  if (!data?.invite_link) {
    return [];
  }
  return parseSeriesInviteLinks(data.invite_link);
};

const resolveSeriesImdbId = async (tmdbId: string, existingImdbId?: string): Promise<string | undefined> => {
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
  try {
    console.log('🔍 Fetching TV series download links for TMDB ID:', tmdbId);

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      const { data, error } = await supabase.functions.invoke('fetch-series', {
        body: {
          tmdbId,
          title,
          imdbId,
        },
      });

      if (!error && data?.success) {
        const links = data.data?.downloadLinks || [];
        console.log('✅ Series data from edge function:', links.length, 'links');
        return {
          tmdbId,
          type: 'tv',
          downloadLinks: links,
        };
      }

      console.warn('Edge function series fetch failed, falling back to client:', error?.message || data?.message);
    } catch (edgeError) {
      console.warn('Edge function invoke error, falling back to client:', edgeError);
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
    console.log('✅ Series links from client fallback:', downloadLinks.length);

    return {
      tmdbId,
      type: 'tv',
      downloadLinks,
      ...(downloadLinks.length === 0 ? { error: 'No download links available for this series' } : {}),
    };
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
