import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useTelegramUrl } from '@/hooks/useTelegramUrl';
import type { Movie } from '@/types/tmdb';

interface LiveWatchModalHeaderProps {
  onClose: () => void;
  title: string;
  hasSeasons: boolean;
  selectedSeasonNumber?: number;
  selectedEpisodeNumber?: number;
  content?: Movie;
}

export const LiveWatchModalHeader = ({
  onClose,
  title,
  hasSeasons,
  selectedSeasonNumber,
  selectedEpisodeNumber,
  content,
}: LiveWatchModalHeaderProps) => {
  const { data: telegramUrl, isLoading: telegramLoading } = useTelegramUrl(content);

  const handleTelegramClick = () => {
    if (telegramUrl) {
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex-shrink-0 z-10 bg-background/90 backdrop-blur-lg border-b border-border shadow-lg">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 overflow-hidden">
            {/* Back Button - only text and icon, no background */}
            <button
              onClick={onClose}
              className="flex items-center px-0 py-0 bg-transparent shadow-none border-none focus:outline-none flex-shrink-0"
              type="button"
            >
              <ArrowLeft className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-baseline gap-3 overflow-hidden">
              <h1 className="text-xl font-bold truncate" title={title}>
                {title}
              </h1>
              {hasSeasons && selectedSeasonNumber && selectedEpisodeNumber && (
                <span className="text-base font-semibold text-muted-foreground flex-shrink-0">
                  S{selectedSeasonNumber} E{selectedEpisodeNumber}
                </span>
              )}
            </div>
          </div>

          {/* Telegram Button - Only show for TV series */}
          {content?.media_type === 'tv' && (
            <div className="flex-shrink-0">
              {telegramLoading ? (
                <button className="flex items-center px-3 py-1 rounded border text-sm text-gray-400 bg-transparent border-gray-300 cursor-not-allowed" disabled>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Loading...
                </button>
              ) : telegramUrl ? (
                <button
                  onClick={handleTelegramClick}
                  className="flex items-center px-2 sm:px-3 py-1 rounded border text-sm text-blue-400 bg-transparent border-blue-500/20 hover:bg-blue-500/10"
                  type="button"
                  aria-label="Download Via Telegram"
                >
                  <MessageCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download Via Telegram</span>
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
