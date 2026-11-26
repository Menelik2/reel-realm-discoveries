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

/**
 * A single explicitly configured streaming provider is used.
 * TMDB supplies metadata only; it does not provide feature-film streams.
 * Set VITE_VIDEO_EMBED_BASE_URL to the base URL of a provider you are
 * authorised to embed. No public mirror domains are used as fallbacks.
 */
const configuredBaseUrl = import.meta.env.VITE_VIDEO_EMBED_BASE_URL?.trim();

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

const DEFAULT_SOURCE = normaliseProviderUrl(configuredBaseUrl);

export const EMBED_SOURCES: EmbedSource[] = DEFAULT_SOURCE
  ? [{ name: 'Configured provider', url: DEFAULT_SOURCE }]
  : [];

function getMediaId({ tmdbId, imdbId }: { tmdbId?: number; imdbId?: string }): string | null {
  if (tmdbId != null && Number.isSafeInteger(tmdbId) && tmdbId > 0) {
    return String(tmdbId);
  }
  if (imdbId && /^tt\d+$/.test(imdbId)) return imdbId;
  return null;
}

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

  const url = new URL(
    type === 'tv'
      ? `${baseUrl}/embed/tv/${encodeURIComponent(id)}/${Math.max(1, Math.floor(season || 1))}/${Math.max(1, Math.floor(episode || 1))}`
      : `${baseUrl}/embed/movie/${encodeURIComponent(id)}`,
  );

  if (dsLang) url.searchParams.set('ds_lang', dsLang);
  if (subUrl) url.searchParams.set('sub_url', subUrl);
  if (autoPlay != null) url.searchParams.set('autoplay', String(autoPlay));
  if (autoNext != null) url.searchParams.set('autonext', String(autoNext));

  return url.toString();
}
