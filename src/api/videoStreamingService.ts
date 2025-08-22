interface VideoSource {
  name: string;
  url: string;
  quality?: string;
  isVip?: boolean;
}

interface StreamingOptions {
  tmdbId?: number;
  imdbId?: string;
  season?: number;
  episode?: number;
  title?: string;
  year?: number;
}

export class VideoStreamingService {
  private static getCleanId(id: string | number): string {
    if (typeof id === 'string') {
      // Remove 'tt' prefix if present for IMDB IDs
      return id.startsWith('tt') ? id.substring(2) : id;
    }
    return id.toString();
  }

  private static async checkVipAvailability(options: StreamingOptions): Promise<boolean> {
    try {
      const { tmdbId, imdbId, season, episode } = options;
      
      let checkUrl = 'https://multiembed.mov/directstream.php?';
      
      if (tmdbId) {
        checkUrl += `video_id=${tmdbId}&tmdb=1`;
      } else if (imdbId) {
        const cleanId = this.getCleanId(imdbId);
        checkUrl += `video_id=${cleanId}`;
      } else {
        return false;
      }

      if (season && episode) {
        checkUrl += `&s=${season}&e=${episode}`;
      }

      checkUrl += '&check=1';

      const response = await fetch(checkUrl);
      const result = await response.text();
      return result.trim() === '1';
    } catch (error) {
      console.error('Error checking VIP availability:', error);
      return false;
    }
  }

  private static buildMultiEmbedUrl(options: StreamingOptions, isVip: boolean = false): string {
    const { tmdbId, imdbId, season, episode } = options;
    
    const baseUrl = isVip 
      ? 'https://multiembed.mov/directstream.php?'
      : 'https://multiembed.mov/?';
    
    let url = baseUrl;
    
    if (tmdbId) {
      url += `video_id=${tmdbId}&tmdb=1`;
    } else if (imdbId) {
      const cleanId = this.getCleanId(imdbId);
      url += `video_id=${cleanId}`;
    } else {
      throw new Error('Either TMDB ID or IMDB ID is required');
    }

    if (season && episode) {
      url += `&s=${season}&e=${episode}`;
    }

    return url;
  }

  static async getVideoSources(options: StreamingOptions): Promise<VideoSource[]> {
    const sources: VideoSource[] = [];

    try {
      // Check VIP availability first
      const vipAvailable = await this.checkVipAvailability(options);
      
      if (vipAvailable) {
        const vipUrl = this.buildMultiEmbedUrl(options, true);
        sources.push({
          name: 'MultiEmbed VIP',
          url: vipUrl,
          quality: 'HD',
          isVip: true
        });
      }

      // Always add standard player as fallback
      const standardUrl = this.buildMultiEmbedUrl(options, false);
      sources.push({
        name: 'MultiEmbed Standard',
        url: standardUrl,
        quality: 'Auto',
        isVip: false
      });

    } catch (error) {
      console.error('Error getting video sources:', error);
      
      // Fallback to standard player if there's an error
      try {
        const fallbackUrl = this.buildMultiEmbedUrl(options, false);
        sources.push({
          name: 'MultiEmbed',
          url: fallbackUrl,
          quality: 'Auto',
          isVip: false
        });
      } catch (fallbackError) {
        console.error('Fallback URL generation failed:', fallbackError);
      }
    }

    return sources;
  }

  static async getMovieSources(tmdbId: number, imdbId?: string): Promise<VideoSource[]> {
    return this.getVideoSources({ tmdbId, imdbId });
  }

  static async getTVShowSources(
    tmdbId: number, 
    season: number, 
    episode: number, 
    imdbId?: string
  ): Promise<VideoSource[]> {
    return this.getVideoSources({ tmdbId, imdbId, season, episode });
  }
}

// Export types
export type { VideoSource, StreamingOptions };