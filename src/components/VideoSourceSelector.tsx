import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, AlertCircle } from 'lucide-react';
import { getMultipleStreamSources } from '@/utils/videoEmbedUtils';
import type { VideoStreamResponse } from '@/api/videoStreamingService';

interface VideoSourceSelectorProps {
  tmdbId?: number;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onSourceSelect: (url: string, source: string) => void;
  className?: string;
}

export const VideoSourceSelector: React.FC<VideoSourceSelectorProps> = ({
  tmdbId,
  imdbId,
  type,
  season,
  episode,
  onSourceSelect,
  className = '',
}) => {
  const [sources, setSources] = useState<VideoStreamResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [quality, setQuality] = useState<'auto' | '720p' | '1080p'>('auto');

  useEffect(() => {
    loadSources();
  }, [tmdbId, imdbId, type, season, episode, quality]);

  const loadSources = async () => {
    if (!tmdbId && !imdbId) return;
    
    setLoading(true);
    try {
      const streamSources = await getMultipleStreamSources({
        tmdbId,
        imdbId,
        type,
        season,
        episode,
        quality,
      });
      
      setSources(streamSources);
      if (streamSources.length > 0 && !selectedSource) {
        setSelectedSource(streamSources[0].streamUrl);
      }
    } catch (error) {
      console.error('Failed to load video sources:', error);
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceChange = (sourceUrl: string) => {
    setSelectedSource(sourceUrl);
    const source = sources.find(s => s.streamUrl === sourceUrl);
    onSourceSelect(sourceUrl, source?.source || 'Unknown');
  };

  const handleQualityChange = (newQuality: 'auto' | '720p' | '1080p') => {
    setQuality(newQuality);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading video sources...</span>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className={`flex items-center justify-center p-4 text-muted-foreground ${className}`}>
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>No video sources available</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Source Selector */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Video Source</label>
          <Select value={selectedSource} onValueChange={handleSourceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select video source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source, index) => (
                <SelectItem key={index} value={source.streamUrl}>
                  <div className="flex items-center gap-2">
                    <span>{source.source}</span>
                    <Badge variant="secondary" className="text-xs">
                      {source.quality}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quality Selector */}
        <div className="sm:w-32">
          <label className="text-sm font-medium mb-2 block">Quality</label>
          <Select value={quality} onValueChange={handleQualityChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="720p">720p HD</SelectItem>
              <SelectItem value="1080p">1080p FHD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Play Button */}
      {selectedSource && (
        <Button 
          onClick={() => handleSourceChange(selectedSource)}
          className="w-full sm:w-auto"
          size="lg"
        >
          <Play className="w-4 h-4 mr-2" />
          Play Video
        </Button>
      )}

      {/* Source Info */}
      {selectedSource && (
        <div className="text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <Badge 
                key={index}
                variant={source.streamUrl === selectedSource ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleSourceChange(source.streamUrl)}
              >
                {source.source} - {source.quality}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};