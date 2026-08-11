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

export function getEmbedUrl({
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
  const baseUrl = source || "https://vidsrc.tw";
  const isPathStyle = baseUrl.includes("vidsrc.sbs") || baseUrl.includes("vidsrc.tw") || baseUrl.includes("vidsrc.xyz");

  // MOVIE
  if (type === "movie") {
    if (isPathStyle) {
      // path-style structure (vidsrc.tw / vidsrc.sbs / vidsrc.xyz)
      if (tmdbId) {
        if (!dsLang && !subUrl && typeof autoPlay === "undefined") {
          return `${baseUrl}/embed/movie/${tmdbId}`;
        } else {
          const params = new URLSearchParams({ tmdb: String(tmdbId) });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined") params.append("autoplay", String(autoPlay));
          return `${baseUrl}/embed/movie?${params.toString()}`;
        }
      }
      if (imdbId) {
        if (!dsLang && !subUrl && typeof autoPlay === "undefined") {
          return `${baseUrl}/embed/movie/${imdbId}`;
        } else {
          const params = new URLSearchParams({ imdb: imdbId });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined") params.append("autoplay", String(autoPlay));
          return `${baseUrl}/embed/movie?${params.toString()}`;
        }
      }
    } else {
      // vidsrc.net structure
      if (tmdbId) {
        if (!dsLang && !subUrl && typeof autoPlay === "undefined") {
          return `${baseUrl}/embed/movie/${tmdbId}`;
        } else {
          const params = new URLSearchParams({ tmdb: String(tmdbId) });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined") params.append("autoplay", String(autoPlay));
          return `${baseUrl}/embed/movie?${params.toString()}`;
        }
      }
      if (imdbId) {
        if (!dsLang && !subUrl && typeof autoPlay === "undefined") {
          return `${baseUrl}/embed/movie/${imdbId}`;
        } else {
          const params = new URLSearchParams({ imdb: imdbId });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined") params.append("autoplay", String(autoPlay));
          return `${baseUrl}/embed/movie?${params.toString()}`;
        }
      }
    }
    return null;
  }

  // TV SHOW - default to season 1, episode 1
  if (type === "tv" && !season && !episode) {
    if (isPathStyle) {
      // path-style structure: /embed/tv/{id}/1/1
      if (tmdbId) {
        if (!dsLang) {
          return `${baseUrl}/embed/tv/${tmdbId}/1/1`;
        } else {
          const params = new URLSearchParams({ tmdb: String(tmdbId), season: "1", episode: "1" });
          params.append("ds_lang", dsLang);
          return `${baseUrl}/embed/tv?${params.toString()}`;
        }
      }
      if (imdbId) {
        if (!dsLang) {
          return `${baseUrl}/embed/tv/${imdbId}/1/1`;
        } else {
          const params = new URLSearchParams({ imdb: imdbId, season: "1", episode: "1" });
          params.append("ds_lang", dsLang);
          return `${baseUrl}/embed/tv?${params.toString()}`;
        }
      }
    } else {
      // vidsrc.net structure
      if (tmdbId) {
        if (!dsLang) {
          return `${baseUrl}/embed/tv/${tmdbId}/1/1`;
        } else {
          const params = new URLSearchParams({ tmdb: String(tmdbId), season: "1", episode: "1" });
          params.append("ds_lang", dsLang);
          return `${baseUrl}/embed/tv?${params.toString()}`;
        }
      }
      if (imdbId) {
        if (!dsLang) {
          return `${baseUrl}/embed/tv/${imdbId}/1/1`;
        } else {
          const params = new URLSearchParams({ imdb: imdbId, season: "1", episode: "1" });
          params.append("ds_lang", dsLang);
          return `${baseUrl}/embed/tv?${params.toString()}`;
        }
      }
    }
    return null;
  }

  // TV SHOW with specific season/episode
  if (type === "tv" && season && episode) {
    if (isPathStyle) {
      // path-style structure: /embed/tv/{id}/{season}/{episode}
      if (tmdbId) {
        if (
          !dsLang &&
          !subUrl &&
          typeof autoPlay === "undefined" &&
          typeof autoNext === "undefined"
        ) {
          return `${baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;
        } else {
          const params = new URLSearchParams({
            tmdb: String(tmdbId),
            season: String(season),
            episode: String(episode),
          });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined") params.append("autoplay", String(autoPlay));
          if (typeof autoNext !== "undefined") params.append("autonext", String(autoNext));
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
          return `${baseUrl}/embed/tv/${imdbId}/${season}/${episode}`;
        } else {
          const params = new URLSearchParams({
            imdb: imdbId,
            season: String(season),
            episode: String(episode),
          });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined") params.append("autoplay", String(autoPlay));
          if (typeof autoNext !== "undefined") params.append("autonext", String(autoNext));
          return `${baseUrl}/embed/tv?${params.toString()}`;
        }
      }
    } else {
      // vidsrc.net structure  
      if (tmdbId) {
        if (
          !dsLang &&
          !subUrl &&
          typeof autoPlay === "undefined" &&
          typeof autoNext === "undefined"
        ) {
          return `${baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;
        } else {
          const params = new URLSearchParams({
            tmdb: String(tmdbId),
            season: String(season),
            episode: String(episode),
          });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined") params.append("autoplay", String(autoPlay));
          if (typeof autoNext !== "undefined") params.append("autonext", String(autoNext));
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
          return `${baseUrl}/embed/tv/${imdbId}/${season}/${episode}`;
        } else {
          const params = new URLSearchParams({
            imdb: imdbId,
            season: String(season),
            episode: String(episode),
          });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined") params.append("autoplay", String(autoPlay));
          if (typeof autoNext !== "undefined") params.append("autonext", String(autoNext));
          return `${baseUrl}/embed/tv?${params.toString()}`;
        }
      }
    }
    return null;
  }
  return null;
}
