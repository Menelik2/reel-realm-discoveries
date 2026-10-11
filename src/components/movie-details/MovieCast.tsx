import { Link } from 'react-router-dom';

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

interface MovieCastProps {
  cast: Cast[];
  onActorClick?: (actorId: number) => void;
}

export const MovieCast = ({ cast, onActorClick }: MovieCastProps) => {
  if (cast.length === 0) return null;

  return (
    <div>
      <div className="media-row-edge">
        <div className="media-row">
          {cast.slice(0, 16).map(actor => (
            <Link
              key={actor.id}
              to={`/person/${actor.id}`}
              onClick={() => onActorClick?.(actor.id)}
              className="group w-[100px] sm:w-[112px] md:w-[124px] text-center shrink-0"
            >
              <div
                className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-secondary mb-2 ring-1 ring-border/40 transition-all duration-300 group-hover:ring-primary/30 group-hover:scale-[1.03]"
                style={{ boxShadow: 'var(--card-shadow)' }}
              >
                <img
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                      : '/placeholder.svg'
                  }
                  alt={actor.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {actor.name}
              </p>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {actor.character}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
