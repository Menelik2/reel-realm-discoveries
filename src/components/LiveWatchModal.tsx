import { useState } from 'react';
import { useLiveWatchModal } from './live-watch-modal/useLiveWatchModal';
import { LiveWatchModalHeader } from './live-watch-modal/LiveWatchModalHeader';
import { MovieView } from './live-watch-modal/MovieView';
import { TVShowView } from './live-watch-modal/TVShowView';
import { Season } from './live-watch-modal/types';

interface LiveWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
  contentType: 'movie' | 'tv';
  title: string;
  seasons?: Season[];
}

export const LiveWatchModal = ({ isOpen, onClose, movieId, contentType, title, seasons = [] }: LiveWatchModalProps) => {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number | undefined>();
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number | undefined>();
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [selectedSource, setSelectedSource] = useState('https://vidsrc.pro');

  const hasSeasons = contentType === 'tv' && seasons && seasons.filter(s => s.season_number > 0).length > 0;

  useLiveWatchModal({
    isOpen,
    onClose,
    hasSeasons,
    seasons,
    setCurrentSeason,
    setSelectedSeasonNumber,
    setSelectedEpisodeNumber,
    setSelectedSource,
  });

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
      <LiveWatchModalHeader
        onClose={onClose}
        title={title}
        hasSeasons={hasSeasons}
        selectedSeasonNumber={selectedSeasonNumber}
        selectedEpisodeNumber={selectedEpisodeNumber}
      />

      <div className="pt-16 h-full w-full flex flex-col">
        {contentType === 'tv' ? (
          <TVShowView
            movieId={movieId}
            title={title}
            seasons={seasons}
            currentSeason={currentSeason}
            selectedSeasonNumber={selectedSeasonNumber}
            selectedEpisodeNumber={selectedEpisodeNumber}
            onSeasonChange={handleSeasonChange}
            onEpisodeChange={setSelectedEpisodeNumber}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            onClose={onClose}
          />
        ) : (
          <MovieView
            movieId={movieId}
            contentType={contentType}
            title={title}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};
