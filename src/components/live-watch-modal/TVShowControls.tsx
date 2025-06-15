
import { Play } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SourceSelector } from './SourceSelector';
import { Season } from './types';

interface TVShowControlsProps {
  seasons: Season[];
  currentSeason: Season;
  selectedSeasonNumber: number;
  selectedEpisodeNumber: number;
  onSeasonChange: (seasonNumber: string) => void;
  onEpisodeChange: (episodeNumber: number) => void;
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

export const TVShowControls = ({
  seasons,
  currentSeason,
  selectedSeasonNumber,
  selectedEpisodeNumber,
  onSeasonChange,
  onEpisodeChange,
  selectedSource,
  onSourceChange,
}: TVShowControlsProps) => {
  return (
    <div className="w-full lg:w-1/4 lg:order-1 flex flex-col gap-4">
      <SourceSelector selectedSource={selectedSource} onSourceChange={onSourceChange} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Season</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={onSeasonChange} value={String(selectedSeasonNumber)}>
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
                onClick={() => onEpisodeChange(epNum)}
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
  );
};
