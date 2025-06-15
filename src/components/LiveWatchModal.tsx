
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, ArrowLeft } from 'lucide-react';
import VideoEmbed from './VideoEmbed';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VideoPlayerLoader from './video-embed/VideoPlayerLoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [selectedSource, setSelectedSource] = useState('https://vidsrc.to');

  const sources = [
    { name: 'VidSrc TO', url: 'https://vidsrc.to' },
    { name: 'VidSrc ME', url: 'https://vidsrc.me' },
    { name: 'VidSrc PRO', url: 'https://vidsrc.pro' },
  ];

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
      setSelectedSource('https://vidsrc.to'); // Reset source on open
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

  const sourceSelector = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Video Source</CardTitle>
        <CardDescription>
          If one source doesn't work, try another.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sources.map(source => (
            <Button
              key={source.name}
              variant={selectedSource === source.url ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSource(source.url)}
            >
              {source.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="flex-grow flex flex-col lg:flex-row gap-6 p-4 container mx-auto max-w-7xl">
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
                    source={selectedSource}
                  />
                </div>
                <div className="w-full lg:w-1/4 lg:order-1 flex flex-col gap-4">
                  {sourceSelector}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Season</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select onValueChange={handleSeasonChange} value={String(selectedSeasonNumber)}>
                        <SelectTrigger><SelectValue placeholder="Select a season" /></SelectTrigger>
                        <SelectContent>
                          {seasons.filter(s => s.season_number > 0).map(s => (
                            <SelectItem key={s.id} value={String(s.season_number)}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Episode</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-64 lg:max-h-[calc(100vh-30rem)] overflow-y-auto">
                        {Array.from({ length: currentSeason.episode_count }, (_, i) => i + 1).map(epNum => (
                          <button
                            key={epNum}
                            onClick={() => setSelectedEpisodeNumber(epNum)}
                            className={`w-full text-left p-3 flex items-center gap-3 text-sm transition-colors border-b last:border-b-0 ${selectedEpisodeNumber === epNum ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                          >
                            <Play className={`h-4 w-4 flex-shrink-0 ${selectedEpisodeNumber === epNum ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                            <span className="truncate">Episode {epNum}</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-start p-4 pt-8 md:p-8">
            <div className="w-full max-w-4xl space-y-6">
              {sourceSelector}
              <VideoEmbed 
                tmdbId={movieId} 
                type={contentType} 
                title={title} 
                autoPlay={1}
                source={selectedSource}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
