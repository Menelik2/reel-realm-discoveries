
import { Button } from '@/components/ui/button';
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

export const LiveWatchModalHeader = ({ onClose, title, hasSeasons, selectedSeasonNumber, selectedEpisodeNumber, content }: LiveWatchModalHeaderProps) => {
  const { data: telegramUrl, isLoading: telegramLoading } = useTelegramUrl(content);

  const handleTelegramClick = () => {
    if (telegramUrl) {
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    }
  };
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 overflow-hidden">
            <Button variant="ghost" size="lg" onClick={onClose} className="hover:bg-accent -ml-4 flex-shrink-0">
              <ArrowLeft className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
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
                <Button variant="outline" size="sm" disabled>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Loading...
                </Button>
              ) : telegramUrl ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTelegramClick}
                  className="bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Telegram
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
