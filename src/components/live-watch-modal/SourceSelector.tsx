
import { Button } from '@/components/ui/button';

interface SourceSelectorProps {
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

const sources = [
  { name: 'VidSrc CC', url: 'hhttps://vidsrc.cc/v2/embed' },
  { name: 'VidSrc XYZ', url: 'https://vidsrc.cc/v2' },
  { name: 'VidSrc ME', url: 'https://vidsrc.me' },
  { name: 'VidSrc PRO', url: 'https://vidsrc.pro' },
];

export const SourceSelector = ({ selectedSource, onSourceChange }: SourceSelectorProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-lg bg-card/50 p-3 ring-1 ring-inset ring-white/10">
      <p className="text-sm font-medium text-muted-foreground flex-shrink-0">Video Source:</p>
      <div className="flex flex-wrap gap-2">
        {sources.map(source => (
          <Button
            key={source.name}
            variant={selectedSource === source.url ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onSourceChange(source.url)}
            className="transition-all"
          >
            {source.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
