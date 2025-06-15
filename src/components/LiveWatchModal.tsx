import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, ArrowLeft } from 'lucide-react';
import VideoEmbed from './VideoEmbed';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VideoPlayerLoader from './video-embed/VideoPlayerLoader';

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

interface LiveWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
  contentType: 'movie' | 'tv';
  title: string;
  seasons?: Season[];
}

export const LiveWatchModal = ({ isOpen, onClose, movieId, contentType, title, seasons }: LiveWatchModalProps) => {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number | undefined>();
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number | undefined>();
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);

  const hasSeasons = contentType === 'tv' && seasons && seasons.filter(s => s.season_number > 0).length > 0;

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (hasSeasons) {
        const validSeasons = seasons.filter(s => s.season_number > 0);
        const initialSeason = validSeasons[0];
        setCurrentSeason(initialSeason);
        setSelectedSeasonNumber(initialSeason.season_number);
        setSelectedEpisodeNumber(1);
      }
    } else {
      document.body.style.overflow = 'unset';
      // Reset state on close
      setSelectedSeasonNumber(undefined);
      setSelectedEpisodeNumber(undefined);
      setCurrentSeason(null);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, hasSeasons, seasons]);

  if (!isOpen) return null;

  const handleSeasonChange = (seasonNumberStr: string) => {
    const seasonNumber = parseInt(seasonNumberStr, 10);
    const season = seasons?.find(s => s.season_number === seasonNumber);
    if (season) {
      setCurrentSeason(season);
      setSelectedSeasonNumber(season.season_number);
      setSelectedEpisodeNumber(1);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden animate-fade-in duration-300">
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="lg" onClick={onClose} className="hover:bg-accent -ml-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h1 className="text-lg font-semibold truncate">
                Watch: {title}
                {hasSeasons && selectedSeasonNumber && selectedEpisodeNumber && ` - S${selectedSeasonNumber} E${selectedEpisodeNumber}`}
              </h1>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-16 h-full w-full flex flex-col">
        {hasSeasons ? (
          <div className="flex-grow flex flex-col lg:flex-row gap-4 p-4 container mx-auto max-w-7xl">
            {!currentSeason ? (
              <VideoPlayerLoader />
            ) : (
              <>
                <div className="w-full lg:w-3/4 lg:order-2">
                  <VideoEmbed
                    tmdbId={movieId}
                    type="tv"
                    title={`${title} - S${selectedSeasonNumber} E${selectedEpisodeNumber}`}
                    season={selectedSeasonNumber}
                    episode={selectedEpisodeNumber}
                    autoPlay={1}
                  />
                </div>
                <div className="w-full lg:w-1/4 lg:order-1 flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Season</h3>
                    <Select onValueChange={handleSeasonChange} value={String(selectedSeasonNumber)}>
                      <SelectTrigger><SelectValue placeholder="Select a season" /></SelectTrigger>
                      <SelectContent>
                        {seasons.filter(s => s.season_number > 0).map(s => (
                          <SelectItem key={s.id} value={String(s.season_number)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Episode</h3>
                    <div className="max-h-64 lg:max-h-[calc(100vh-20rem)] overflow-y-auto rounded-md border bg-background/50">
                      {Array.from({ length: currentSeason.episode_count }, (_, i) => i + 1).map(epNum => (
                        <button
                          key={epNum}
                          onClick={() => setSelectedEpisodeNumber(epNum)}
                          className={`w-full text-left p-3 flex items-center gap-3 text-sm transition-colors ${selectedEpisodeNumber === epNum ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                        >
                          <Play className={`h-4 w-4 flex-shrink-0 ${selectedEpisodeNumber === epNum ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          <span className="truncate">Episode {epNum}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          // For movies, directly show the player without the "Start Watching" screen
          <div className="flex-grow flex items-center justify-center p-4 md:p-8">
            <VideoEmbed tmdbId={movieId} type={contentType} title={title} autoPlay={1} />
          </div>
        )}
      </div>
    </div>
  );
};
