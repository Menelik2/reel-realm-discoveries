export interface EmbedSource {
  name: string;
  url: string;
}

interface EmbedUrlParams {
  tmdbId?: number;
  imdbId?: string;
  type?: 'movie' | 'tv';
  season?: number;
  episode?: number;
  dsLang?: string;
  subUrl?: string;
  autoPlay?: 1 | 0;
  autoNext?: 1 | 0;
  source?: string;
}

function normaliseProviderUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

/** Optional env override — put your preferred provider first. */
const envBase = normaliseProviderUrl(import.meta.env.VITE_VIDEO_EMBED_BASE_URL?.trim());

/** Default mirrors used when env is unset (first-success failover in the player). */
const BUILTIN_SOURCES: EmbedSource[] = [
  { name: 'VidSrc', url: 'https://vidsrc.sh' },
  { name: 'Buzz', url: 'https://vidsrc.buzz' },
  { name: 'Party', url: 'https://vidsrc.party' },
];

export const EMBED_SOURCES: EmbedSource[] = envBase
  ? [
      { name: 'Primary', url: envBase },
      ...BUILTIN_SOURCES.filter((s) => s.url !== envBase),
    ]
  : BUILTIN_SOURCES;

const DEFAULT_SOURCE = EMBED_SOURCES[0]?.url ?? null;

function getMediaId({ tmdbId, imdbId }: { tmdbId?: number; imdbId?: string }): string | null {
  if (tmdbId != null && Number.isSafeInteger(tmdbId) && tmdbId > 0) {
    return String(tmdbId);
  }
  if (imdbId && /^tt\d+$/.test(imdbId)) return imdbId;
  return null;
}

/**
 * Build embed URL for movie / TV episode.
 * Path style: /embed/movie/{id} · /embed/tv/{id}/{season}/{episode}
 */
export function getEmbedUrl({
  tmdbId,
  imdbId,
  type = 'movie',
  season,
  episode,
  dsLang,
  subUrl,
  autoPlay,
  autoNext,
  source,
}: EmbedUrlParams): string | null {
  const baseUrl = normaliseProviderUrl(source) || DEFAULT_SOURCE;
  const id = getMediaId({ tmdbId, imdbId });
  if (!baseUrl || !id) return null;

  const s = Math.max(1, Math.floor(season || 1));
  const e = Math.max(1, Math.floor(episode || 1));

  const path =
    type === 'tv'
      ? `/embed/tv/${encodeURIComponent(id)}/${s}/${e}`
      : `/embed/movie/${encodeURIComponent(id)}`;

  const url = new URL(`${baseUrl}${path}`);
  if (dsLang) url.searchParams.set('ds_lang', dsLang);
  if (subUrl) url.searchParams.set('sub_url', subUrl);
  if (autoPlay != null) url.searchParams.set('autoplay', String(autoPlay));
  if (autoNext != null) url.searchParams.set('autonext', String(autoNext));

  return url.toString();
}
