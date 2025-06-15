
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';

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
  );
};
