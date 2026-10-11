import { Button } from '@/components/ui/button';
import { X, ArrowLeft } from 'lucide-react';

interface MovieDetailsHeaderProps {
  backdropPath: string;
  title: string;
  onClose: () => void;
}

export const MovieDetailsHeader = ({ backdropPath, title, onClose }: MovieDetailsHeaderProps) => {
  return (
    <div className="relative h-52 sm:h-72 md:h-96 lg:h-[28rem] overflow-hidden">
      {backdropPath ? (
        <img
          src={`https://image.tmdb.org/t/p/w1280${backdropPath}`}
          alt=""
          className="w-full h-full object-cover object-center scale-105"
          decoding="async"
          fetchPriority="high"
        />
      ) : (
        <div className="w-full h-full bg-secondary" />
      )}

      {/* Layered cinematic gradients — stronger bottom fade so poster overlap is clean */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent" />

      {/* Nav controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-10 rounded-full bg-background/40 hover:bg-background/60 text-foreground border border-border/40 backdrop-blur-md shadow-sm px-4 gap-2 pressable"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline text-sm font-medium">Back</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-background/40 hover:bg-background/60 text-foreground border border-border/40 backdrop-blur-md shadow-sm lg:hidden pressable"
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      {/* Title lives in MovieInfo below the poster — not here, to avoid clipping under the overlapping poster */}
      <span className="sr-only">{title}</span>
    </div>
  );
};
