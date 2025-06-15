
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SourceSelectorProps {
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

const sources = [
  { name: 'VidSrc TO', url: 'https://vidsrc.to' },
  { name: 'VidSrc ME', url: 'https://vidsrc.me' },
  { name: 'VidSrc PRO', url: 'https://vidsrc.pro' },
];

export const SourceSelector = ({ selectedSource, onSourceChange }: SourceSelectorProps) => {
  return (
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
              onClick={() => onSourceChange(source.url)}
            >
              {source.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
