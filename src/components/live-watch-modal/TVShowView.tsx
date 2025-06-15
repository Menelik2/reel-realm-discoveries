
import VideoEmbed from '@/components/VideoEmbed';
import VideoPlayerLoader from '@/components/video-embed/VideoPlayerLoader';
import { TVShowControls } from './TVShowControls';
import { Season } from './types';

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
}: TVShowViewProps) => {
  return (
    <div className="flex-grow flex flex-col lg:flex-row gap-6 p-4 container mx-auto max-w-7xl">
      {!currentSeason || !selectedSeasonNumber || !selectedEpisodeNumber ? (
        <VideoPlayerLoader />
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
  );
};
