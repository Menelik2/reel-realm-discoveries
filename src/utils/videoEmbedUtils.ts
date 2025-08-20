import { videoStreamingService, VideoStreamRequest } from '@/api/videoStreamingService';

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
  quality?: 'auto' | '720p' | '1080p';
}

export async function getEmbedUrl({
  tmdbId,
  imdbId,
  type = "movie",
  season,
  episode,
  dsLang,
  subUrl,
  autoPlay,
  autoNext,
  source,
  quality = 'auto',
}: EmbedUrlParams): Promise<string | null> {
  // If a specific source is provided, use the legacy logic
  if (source) {
    return getLegacyEmbedUrl({
      tmdbId,
      imdbId,
      type,
      season,
      episode,
      dsLang,
      subUrl,
      autoPlay,
      autoNext,
      source,
    });
  }

  // Use the new streaming service for better reliability
  const request: VideoStreamRequest = {
    tmdbId,
    imdbId,
    type,
    season,
    episode,
    quality,
    language: dsLang,
    subtitles: !!subUrl,
  };

  try {
    const stream = await videoStreamingService.getStreamUrl(request);
    return stream?.streamUrl || null;
  } catch (error) {
    console.error('Failed to get stream URL:', error);
    // Fallback to legacy logic
    return getLegacyEmbedUrl({
      tmdbId,
      imdbId,
      type,
      season,
      episode,
      dsLang,
      subUrl,
      autoPlay,
      autoNext,
      source: 'https://vidsrc.cc/v2',
    });
  }
}

// Legacy embed URL logic as fallback
function getLegacyEmbedUrl({
  tmdbId,
  imdbId,
  type = "movie",
  season,
  episode,
  dsLang,
  subUrl,
  autoPlay,
  autoNext,
  source,
}: EmbedUrlParams): string | null {
  const baseUrl = source || "https://vidsrc.cc/v2";

  // MOVIE
  if (type === "movie") {
    // Use /embed/movie/{tmdbId} if available (preferred)
    if (tmdbId) {
      if (!dsLang && !subUrl && typeof autoPlay === "undefined") {
        return `${baseUrl}/embed/movie/${tmdbId}`;
      } else {
        // query version
        const params = new URLSearchParams({ tmdb: String(tmdbId) });
        if (dsLang) params.append("ds_lang", dsLang);
        if (subUrl) params.append("sub_url", subUrl);
        if (typeof autoPlay !== "undefined")
          params.append("autoplay", String(autoPlay));
        return `${baseUrl}/embed/movie?${params.toString()}`;
      }
    }
    // Otherwise, fallback to imdbId
    if (imdbId) {
      if (!dsLang && !subUrl && typeof autoPlay === "undefined") {
        return `${baseUrl}/embed/movie/${imdbId}`;
      } else {
        // query version
        const params = new URLSearchParams({ imdb: imdbId });
        if (dsLang) params.append("ds_lang", dsLang);
        if (subUrl) params.append("sub_url", subUrl);
        if (typeof autoPlay !== "undefined")
          params.append("autoplay", String(autoPlay));
        return `${baseUrl}/embed/movie?${params.toString()}`;
      }
    }
    return null;
  }

  // TV SHOW
  if (type === "tv" && !season && !episode) {
    if (tmdbId) {
      if (!dsLang) {
        return `${baseUrl}/embed/tv/${tmdbId}`;
      } else {
        const params = new URLSearchParams({ tmdb: String(tmdbId) });
        params.append("ds_lang", dsLang);
        return `${baseUrl}/embed/tv?${params.toString()}`;
      }
    }
    if (imdbId) {
      if (!dsLang) {
        return `${baseUrl}/embed/tv/${imdbId}`;
      } else {
        const params = new URLSearchParams({ imdb: imdbId });
        params.append("ds_lang", dsLang);
        return `${baseUrl}/embed/tv?${params.toString()}`;
      }
    }
    return null;
  }

  // EPISODE
  if (type === "tv" && season && episode) {
    if (tmdbId) {
      if (
        !dsLang &&
        !subUrl &&
        typeof autoPlay === "undefined" &&
        typeof autoNext === "undefined"
      ) {
        return `${baseUrl}/embed/tv/${tmdbId}/${season}-${episode}`;
      } else {
        const params = new URLSearchParams({
          tmdb: String(tmdbId),
          season: String(season),
          episode: String(episode),
        });
        if (dsLang) params.append("ds_lang", dsLang);
        if (subUrl) params.append("sub_url", subUrl);
        if (typeof autoPlay !== "undefined")
          params.append("autoplay", String(autoPlay));
        if (typeof autoNext !== "undefined")
          params.append("autonext", String(autoNext));
        return `${baseUrl}/embed/tv?${params.toString()}`;
      }
    }
    if (imdbId) {
      if (
        !dsLang &&
        !subUrl &&
        typeof autoPlay === "undefined" &&
        typeof autoNext === "undefined"
      ) {
        return `${baseUrl}/embed/tv/${imdbId}/${season}-${episode}`;
      } else {
        const params = new URLSearchParams({
          imdb: imdbId,
          season: String(season),
          episode: String(episode),
        });
        if (dsLang) params.append("ds_lang", dsLang);
        if (subUrl) params.append("sub_url", subUrl);
        if (typeof autoPlay !== "undefined")
          params.append("autoplay", String(autoPlay));
        if (typeof autoNext !== "undefined")
          params.append("autonext", String(autoNext));
        return `${baseUrl}/embed/tv?${params.toString()}`;
      }
    }
    return null;
  }
  return null;
}

// Export additional utility functions
export async function getMultipleStreamSources(params: EmbedUrlParams) {
  const request: VideoStreamRequest = {
    tmdbId: params.tmdbId,
    imdbId: params.imdbId,
    type: params.type || 'movie',
    season: params.season,
    episode: params.episode,
    quality: params.quality,
    language: params.dsLang,
    subtitles: !!params.subUrl,
  };

  try {
    return await videoStreamingService.getMultipleStreams(request);
  } catch (error) {
    console.error('Failed to get multiple stream sources:', error);
    return [];
  }
}
