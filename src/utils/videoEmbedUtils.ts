import { VideoStreamingService } from '@/api/videoStreamingService';

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
  // Use the new multiembed service
  try {
    const sources = type === 'movie' 
      ? await VideoStreamingService.getMovieSources(tmdbId!, imdbId)
      : await VideoStreamingService.getTVShowSources(tmdbId!, season!, episode!, imdbId);
    
    return sources[0]?.url || null;
  } catch (error) {
    console.error('Failed to get stream URL:', error);
    return null;
  }
}

// Export additional utility functions
export async function getMultipleStreamSources(params: EmbedUrlParams) {
  try {
    const sources = params.type === 'movie' 
      ? await VideoStreamingService.getMovieSources(params.tmdbId!, params.imdbId)
      : await VideoStreamingService.getTVShowSources(params.tmdbId!, params.season!, params.episode!, params.imdbId);
    
    return sources.map(source => ({
      streamUrl: source.url,
      source: source.name,
      quality: source.quality || 'Auto'
    }));
  } catch (error) {
    console.error('Failed to get multiple stream sources:', error);
    return [];
  }
}