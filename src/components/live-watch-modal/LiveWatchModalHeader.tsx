
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface LiveWatchModalHeaderProps {
  onClose: () => void;
  title: string;
  hasSeasons: boolean;
  selectedSeasonNumber?: number;
  selectedEpisodeNumber?: number;
}

export const LiveWatchModalHeader = ({ onClose, title, hasSeasons, selectedSeasonNumber, selectedEpisodeNumber }: LiveWatchModalHeaderProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-start p-4">
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
        </div>
      </div>
    </div>
  );
};
