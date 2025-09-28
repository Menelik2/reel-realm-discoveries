
import { Button } from '@/components/ui/button';
import { X, ArrowLeft } from 'lucide-react';

interface MovieDetailsHeaderProps {
  backdropPath: string;
  title: string;
  onClose: () => void;
}

export const MovieDetailsHeader = ({ backdropPath, title, onClose }: MovieDetailsHeaderProps) => {
  return (
    <div className="relative h-64 md:h-80 lg:h-96">
      <img
        src={`https://image.tmdb.org/t/p/original${backdropPath}`}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      
      {/* Close button - more accessible */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button
          variant="ghost"
          size="lg"
          onClick={onClose}
          className="bg-black/20 hover:bg-black/40 text-white border border-white/20 backdrop-blur-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-black/20 hover:bg-black/40 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Title overlay for mobile */}
      <div className="absolute bottom-4 left-4 right-4 md:hidden">
        <h1 className="text-white text-xl font-bold drop-shadow-lg line-clamp-2">
          {title}
        </h1>
      </div>
    </div>
  );
};
