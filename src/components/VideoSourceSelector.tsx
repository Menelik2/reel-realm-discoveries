import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Monitor, Zap } from "lucide-react";

interface VideoSource {
  name: string;
  url: string;
  quality?: string;
  isVip?: boolean;
}

interface VideoSourceSelectorProps {
  sources: VideoSource[];
  currentIndex: number;
  onSourceChange: (index: number) => void;
}

export const VideoSourceSelector = ({
  sources,
  currentIndex,
  onSourceChange,
}: VideoSourceSelectorProps) => {
  if (sources.length <= 1) return null;

  const currentSource = sources[currentIndex];

  return (
    <div className="flex items-center justify-between mb-3 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Monitor className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Video Source:</span>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {currentSource.isVip && <Zap className="h-3 w-3 text-amber-500" />}
            {currentSource.name}
            {currentSource.quality && (
              <Badge variant="secondary" className="text-xs">
                {currentSource.quality}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end">
          {sources.map((source, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => onSourceChange(index)}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                {source.isVip && <Zap className="h-3 w-3 text-amber-500" />}
                <span>{source.name}</span>
              </div>
              
              {source.quality && (
                <Badge 
                  variant={source.isVip ? "default" : "secondary"} 
                  className="text-xs"
                >
                  {source.quality}
                </Badge>
              )}
              
              {index === currentIndex && (
                <Badge variant="outline" className="text-xs">
                  Current
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};