import { Button } from '@/components/ui/button';
import { X, ArrowLeft } from 'lucide-react';

interface MovieDetailsHeaderProps {
  backdropPath: string;
  title: string;
  onClose: () => void;
}

export const MovieDetailsHeader = ({ backdropPath, title, onClose }: MovieDetailsHeaderProps) => {
  return (
    <div className="relative h-56 sm:h-72 md:h-96 lg:h-[28rem] overflow-hidden">
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

      {/* Layered cinematic gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

      {/* Nav controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-10 rounded-full bg-background/40 hover:bg-background/60 text-foreground border border-border/40 backdrop-blur-md shadow-sm px-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-sm font-medium">Back</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-background/40 hover:bg-background/60 text-foreground border border-border/40 backdrop-blur-md shadow-sm lg:hidden"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile title in hero */}
      <div className="absolute bottom-6 left-4 right-4 md:hidden">
        <h1 className="text-foreground text-xl font-playfair font-bold drop-shadow-sm line-clamp-2 tracking-tight">
          {title}
        </h1>
      </div>
    </div>
  );
};
