import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { LiveWatchModalHeader } from '@/components/live-watch-modal/LiveWatchModalHeader';
import type { Movie } from '@/types/tmdb';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Maximize2 } from 'lucide-react';
import { getEmbedUrl } from '@/utils/videoEmbedUtils';

const SOURCES = [
  { name: 'VidSrc TW', url: 'https://vidsrc.tw' },
];

interface SeasonLite {
  id?: number;
  name?: string;
  season_number: number;
  episode_count: number;
}

interface LiveWatchModalProps {
  open: boolean;
  onClose: () => void;
  id: string;
  type: "movie" | "tv";
  title?: string;
  content?: Movie & { seasons?: SeasonLite[] };
}

const LiveWatchModal: React.FC<LiveWatchModalProps> = ({
  open,
  onClose,
  id,
  type,
  title = "Watch Now",
  content,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showClickShield, setShowClickShield] = useState(true);
  const [selectedSource, setSelectedSource] = useState(SOURCES[0].url);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Season/episode state (TV only)
  const seasons: SeasonLite[] = useMemo(() => {
    if (!content?.seasons) return [];
    return content.seasons.filter((s) => s.season_number > 0);
  }, [content?.seasons]);

  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);

  useEffect(() => {
    if (open && seasons.length > 0) {
      setSelectedSeason(seasons[0].season_number);
      setSelectedEpisode(1);
    }
  }, [open, seasons]);

  const currentSeason = seasons.find((s) => s.season_number === selectedSeason);
  const maxEpisodes = currentSeason?.episode_count || 1;

  const handleSourceChange = useCallback((url: string) => {
    setSelectedSource(url);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Build embed URL
  const numericId = Number(id);
  const isNumeric = !isNaN(numericId) && String(numericId) === id;

  const embedUrl = getEmbedUrl({
    tmdbId: isNumeric ? numericId : undefined,
    imdbId: !isNumeric ? id : undefined,
    type,
    season: type === "tv" ? selectedSeason : undefined,
    episode: type === "tv" ? selectedEpisode : undefined,
    source: selectedSource,
  });

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl mx-4 bg-background rounded-xl overflow-hidden shadow-2xl border border-white/10"
      >
        <LiveWatchModalHeader title={title} onClose={onClose} />

        <div className="p-4 space-y-4">
          {/* Source selector */}
          <div className="flex flex-wrap items-center gap-2">
            {SOURCES.map(source => (
              <Button
                key={source.url}
                variant={selectedSource === source.url ? 'default' : 'outline'}
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleSourceChange(source.url); }}
              >
                {source.name}
              </Button>
            ))}

            {type === "tv" && seasons.length > 0 && (
              <>
                <Select
                  value={String(selectedSeason)}
                  onValueChange={(v) => {
                    setSelectedSeason(Number(v));
                    setSelectedEpisode(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((s) => (
                      <SelectItem key={s.season_number} value={String(s.season_number)}>
                        {s.name || `Season ${s.season_number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(selectedEpisode)}
                  onValueChange={(v) => setSelectedEpisode(Number(v))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Episode" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxEpisodes }, (_, i) => i + 1).map((ep) => (
                      <SelectItem key={ep} value={String(ep)}>
                        Episode {ep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="ml-auto">
              <Maximize2 className="h-4 w-4 mr-1" />
              Fullscreen
            </Button>
          </div>

          {/* Player */}
          <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
            {showClickShield && (
              <div
                className="absolute inset-0 z-20 cursor-pointer"
                onClick={() => setShowClickShield(false)}
                title="Click to interact with player"
              />
            )}
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer"
                title={`Watch ${title}`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Unable to load player
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LiveWatchModal;
