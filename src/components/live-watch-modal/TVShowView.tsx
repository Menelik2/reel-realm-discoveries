
import VideoEmbed from '@/components/VideoEmbed';
import VideoPlayerLoader from '@/components/video-embed/VideoPlayerLoader';
import { TVShowControls } from './TVShowControls';
import { Season } from './types';
import { AdBanner } from '../AdBanner';
import { SimilarMovies } from '../SimilarMovies';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TVShowViewProps {
  movieId: number;
  title: string;
  seasons: Season[];
  currentSeason: Season | null;
  selectedSeasonNumber?: number;
  selectedEpisodeNumber?: number;
  onSeasonChange: (seasonNumber: string) => void;
  onEpisodeChange: (episodeNumber: number) => void;
  selectedSource: string;
  onSourceChange: (source: string) => void;
  onClose: () => void;
}

export const TVShowView = ({
  movieId,
  title,
  seasons,
  currentSeason,
  selectedSeasonNumber,
  selectedEpisodeNumber,
  onSeasonChange,
  onEpisodeChange,
  selectedSource,
  onSourceChange,
  onClose,
}: TVShowViewProps) => {
  const navigate = useNavigate();

  const handleSimilarMovieClick = (newMovieId: number) => {
    onClose();
    setTimeout(() => navigate(`/tv/${newMovieId}`), 300);
  };

  return (
    <ScrollArea className="flex-grow container mx-auto max-w-7xl">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {!currentSeason || !selectedSeasonNumber || !selectedEpisodeNumber ? (
            <div className="w-full aspect-video">
              <VideoPlayerLoader />
            </div>
          ) : (
            <>
              <div className="w-full lg:w-3/4 lg:order-2">
                <div className="shadow-2xl shadow-primary/20 rounded-lg ring-1 ring-white/10 focus-within:ring-primary focus-within:ring-2 transition-all">
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
                <div className="mt-4">
                  <AdBanner slot="3456789012" />
                </div>
              </div>
              <TVShowControls
                seasons={seasons}
                currentSeason={currentSeason}
                selectedSeasonNumber={selectedSeasonNumber}
                selectedEpisodeNumber={selectedEpisodeNumber}
                onSeasonChange={onSeasonChange}
                onEpisodeChange={onEpisodeChange}
                selectedSource={selectedSource}
                onSourceChange={onSourceChange}
              />
            </>
          )}
        </div>
        <div className="w-full mt-8">
          <SimilarMovies
            movieId={movieId}
            contentType="tv"
            onMovieClick={handleSimilarMovieClick}
          />
        </div>
      </div>
    </ScrollArea>
  );
};
