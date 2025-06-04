
import { Button } from '@/components/ui/button';

interface MovieDetailsHeaderProps {
  backdropPath: string;
  title: string;
  onClose: () => void;
}

export const MovieDetailsHeader = ({ backdropPath, title, onClose }: MovieDetailsHeaderProps) => {
  return (
    <div className="relative h-64 md:h-80">
      <img
        src={`https://image.tmdb.org/t/p/original${backdropPath}`}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      <Button
        variant="ghost"
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/20"
      >
        ✕
      </Button>
    </div>
  );
};
