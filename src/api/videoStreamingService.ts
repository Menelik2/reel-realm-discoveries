interface StreamingSource {
  id: string;
  name: string;
  baseUrl: string;
  priority: number;
  supports: {
    movies: boolean;
    series: boolean;
    subtitles: boolean;
    hd: boolean;
  };
}

interface VideoStreamRequest {
  tmdbId?: number;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  quality?: 'auto' | '720p' | '1080p';
  language?: string;
  subtitles?: boolean;
}

interface VideoStreamResponse {
  streamUrl: string;
  source: string;
  quality: string;
  subtitles?: string[];
  expires?: number;
  directUrl?: boolean;
}

// Multiple streaming sources for better availability
const STREAMING_SOURCES: StreamingSource[] = [
  {
    id: 'vidsrc',
    name: 'VidSrc',
    baseUrl: 'https://vidsrc.cc/v2/embed',
    priority: 1,
    supports: { movies: true, series: true, subtitles: true, hd: true }
  },
  {
    id: 'vidsrcpro',
    name: 'VidSrc Pro',
    baseUrl: 'https://vidsrc.pro/embed',
    priority: 2,
    supports: { movies: true, series: true, subtitles: true, hd: true }
  },
  {
    id: 'superembed',
    name: 'SuperEmbed',
    baseUrl: 'https://multiembed.mov/directstream.php',
    priority: 3,
    supports: { movies: true, series: true, subtitles: false, hd: true }
  },
  {
    id: 'embedsu',
    name: 'EmbedSu',
    baseUrl: 'https://embed.su/embed',
    priority: 4,
    supports: { movies: true, series: true, subtitles: true, hd: true }
  }
];

export class VideoStreamingService {
  private sources: StreamingSource[];

  constructor() {
    this.sources = STREAMING_SOURCES.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get streaming URL for a movie or TV show
   */
  async getStreamUrl(request: VideoStreamRequest): Promise<VideoStreamResponse | null> {
    for (const source of this.sources) {
      try {
        const streamUrl = await this.buildStreamUrl(source, request);
        if (streamUrl) {
          // Test if the stream is accessible
          const isAccessible = await this.testStreamAccessibility(streamUrl);
          if (isAccessible) {
            return {
              streamUrl,
              source: source.name,
              quality: request.quality || 'auto',
              directUrl: false,
              expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };
          }
        }
      } catch (error) {
        console.warn(`Failed to get stream from ${source.name}:`, error);
        continue;
      }
    }

    return null;
  }

  /**
   * Get multiple streaming sources for redundancy
   */
  async getMultipleStreams(request: VideoStreamRequest): Promise<VideoStreamResponse[]> {
    const streams: VideoStreamResponse[] = [];
    
    for (const source of this.sources) {
      try {
        const streamUrl = await this.buildStreamUrl(source, request);
        if (streamUrl) {
          streams.push({
            streamUrl,
            source: source.name,
            quality: request.quality || 'auto',
            directUrl: false,
            expires: Date.now() + (24 * 60 * 60 * 1000)
          });
        }
      } catch (error) {
        console.warn(`Failed to get stream from ${source.name}:`, error);
      }
    }

    return streams;
  }

  /**
   * Build streaming URL based on source and request parameters
   */
  private async buildStreamUrl(source: StreamingSource, request: VideoStreamRequest): Promise<string | null> {
    const { tmdbId, imdbId, type, season, episode, language, subtitles } = request;
    
    // Prefer TMDB ID if available
    const id = tmdbId || imdbId;
    if (!id) return null;

    let url = '';
    const params = new URLSearchParams();

    switch (source.id) {
      case 'vidsrc':
        if (type === 'movie') {
          url = `${source.baseUrl}/movie/${id}`;
        } else if (type === 'tv') {
          if (season && episode) {
            url = `${source.baseUrl}/tv/${id}/${season}-${episode}`;
          } else {
            url = `${source.baseUrl}/tv/${id}`;
          }
        }
        break;

      case 'vidsrcpro':
        if (type === 'movie') {
          url = `${source.baseUrl}/movie/${id}`;
        } else if (type === 'tv' && season && episode) {
          url = `${source.baseUrl}/tv/${id}/${season}/${episode}`;
        }
        break;

      case 'superembed':
        params.append('video_id', String(id));
        params.append('tmdb', '1');
        if (type === 'tv' && season && episode) {
          params.append('s', String(season));
          params.append('e', String(episode));
        }
        url = `${source.baseUrl}?${params.toString()}`;
        break;

      case 'embedsu':
        if (type === 'movie') {
          url = `${source.baseUrl}/movie/${id}`;
        } else if (type === 'tv' && season && episode) {
          url = `${source.baseUrl}/tv/${id}/${season}/${episode}`;
        }
        break;

      default:
        return null;
    }

    // Add common parameters
    if (language) params.append('lang', language);
    if (subtitles && source.supports.subtitles) params.append('sub', '1');
    
    // Append params if any were added
    if (params.toString() && !url.includes('?')) {
      url += `?${params.toString()}`;
    } else if (params.toString()) {
      url += `&${params.toString()}`;
    }

    return url;
  }

  /**
   * Test if a streaming URL is accessible
   */
  private async testStreamAccessibility(url: string): Promise<boolean> {
    try {
      // For iframe embeds, we can't really test accessibility due to CORS
      // So we'll just validate the URL format
      return this.isValidUrl(url);
    } catch {
      return false;
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available qualities for a stream
   */
  getAvailableQualities(): string[] {
    return ['auto', '720p', '1080p'];
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Record<string, string> {
    return {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese'
    };
  }

  /**
   * Search for alternative streaming sources
   */
  async findAlternativeSources(request: VideoStreamRequest): Promise<VideoStreamResponse[]> {
    // This could integrate with additional APIs to find more sources
    return this.getMultipleStreams(request);
  }
}

// Export singleton instance
export const videoStreamingService = new VideoStreamingService();

// Export types
export type { VideoStreamRequest, VideoStreamResponse, StreamingSource };