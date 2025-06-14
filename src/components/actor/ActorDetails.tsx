
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { useActorDetails } from "@/hooks/useActorDetails";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Calendar, MapPin } from "lucide-react";
import { ActorMovieCredits } from "./ActorMovieCredits";

interface ActorDetailsProps {
  actorId: number | null;
  onClose: () => void;
}

const ActorDetailsSkeleton = () => (
    <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-96 w-full" />
    </div>
);


export const ActorDetails = ({ actorId, onClose }: ActorDetailsProps) => {
  const { actor, credits, loading, error } = useActorDetails(actorId);

  return (
    <Sheet open={!!actorId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0">
        {loading && <ActorDetailsSkeleton />}
        {error && (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )}
        {!loading && actor && (
            <>
                <SheetHeader className="p-6 space-y-0 gap-6 text-left">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <Avatar className="h-28 w-28 sm:h-36 sm:w-36 text-lg">
                            <AvatarImage src={`https://image.tmdb.org/t/p/h632${actor.profile_path}`} alt={actor.name} />
                            <AvatarFallback>{actor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="pt-2">
                            <SheetTitle className="text-3xl font-bold">{actor.name}</SheetTitle>
                            <div className="text-muted-foreground mt-2 space-y-1">
                                {actor.birthday && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(actor.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                )}
                                {actor.place_of_birth && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{actor.place_of_birth}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetHeader>
                <div className="px-6 pb-6">
                    {actor.biography ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <h3 className="text-lg font-semibold mb-2">Biography</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap line-clamp-6 leading-relaxed">
                                {actor.biography}
                            </p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No biography available.</p>
                    )}

                    <ActorMovieCredits credits={credits} />
                </div>
            </>
        )}
      </SheetContent>
    </Sheet>
  );
};

