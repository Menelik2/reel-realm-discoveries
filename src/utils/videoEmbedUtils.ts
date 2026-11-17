export interface EmbedSource {
  name: string;
  url: string;
}

/** Working VidSrc-style mirrors (ordered by preference). */
export const EMBED_SOURCES: EmbedSource[] = [
  { name: 'VidSrc', url: 'https://vidsrc.sh' },
  { name: 'Buzz', url: 'https://vidsrc.buzz' },
  { name: 'Party', url: 'https://vidsrc.party' },
  { name: 'VidSrc TW', url: 'https://vidsrc.tw' },
];

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

const DEFAULT_SOURCE = EMBED_SOURCES[0].url;

function mediaId({ tmdbId, imdbId }: { tmdbId?: number; imdbId?: string }): string | null {
  if (tmdbId != null && Number.isFinite(tmdbId)) return String(tmdbId);
  if (imdbId) return imdbId;
  return null;
}

function withQuery(
  base: string,
  params: Record<string, string | undefined>,
): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

/**
 * Build a VidSrc-family embed URL.
 * Path style: /embed/movie/{id} and /embed/tv/{id}/{season}/{episode}
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
  const baseUrl = (source || DEFAULT_SOURCE).replace(/\/$/, '');
  const id = mediaId({ tmdbId, imdbId });
  if (!id) return null;

  const extra = {
    ds_lang: dsLang,
    sub_url: subUrl,
    autoplay: typeof autoPlay !== 'undefined' ? String(autoPlay) : undefined,
    autonext: typeof autoNext !== 'undefined' ? String(autoNext) : undefined,
  };
  const hasExtra = Object.values(extra).some((v) => v != null && v !== '');

  if (type === 'movie') {
    if (!hasExtra) return `${baseUrl}/embed/movie/${id}`;
    return withQuery(`${baseUrl}/embed/movie`, {
      ...(tmdbId != null ? { tmdb: String(tmdbId) } : { imdb: imdbId }),
      ...extra,
    });
  }

  // TV
  const s = season && season > 0 ? season : 1;
  const e = episode && episode > 0 ? episode : 1;

  if (!hasExtra) return `${baseUrl}/embed/tv/${id}/${s}/${e}`;

  return withQuery(`${baseUrl}/embed/tv`, {
    ...(tmdbId != null ? { tmdb: String(tmdbId) } : { imdb: imdbId }),
    season: String(s),
    episode: String(e),
    ...extra,
  });
}
