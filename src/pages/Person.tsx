import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useActorDetails } from '@/hooks/useActorDetails';
import { ActorMovieCredits } from '@/components/actor/ActorMovieCredits';
import { SimilarPeople } from '@/components/actor/SimilarPeople';
import { useSimilarPeople } from '@/hooks/useSimilarPeople';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const SITE_URL = 'https://yeni-movies.lovable.app';

const calcAge = (birthday: string) => {
  const b = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
};

const PersonPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const actorId = id ? parseInt(id, 10) : null;
  const { actor, credits, loading, error } = useActorDetails(
    actorId && !isNaN(actorId) ? actorId : null
  );
  const { people: similarPeople, loading: similarLoading } = useSimilarPeople(
    actorId && !isNaN(actorId) ? actorId : null,
    credits,
  );
  const [expandedBio, setExpandedBio] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [actorId]);

  // Respect user dark mode preference
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const prefersDark =
      stored !== null
        ? stored === 'true'
        : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const root = document.documentElement;
    const body = document.body;
    if (prefersDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, []);

  const handleMovieClick = (movieId: number, contentType: 'movie' | 'tv') => {
    navigate(`/${contentType}/${movieId}`);
  };

  const topKnownFor = useMemo(
    () =>
      credits
        .slice(0, 5)
        .map((c) => c.title || c.name)
        .filter(Boolean) as string[],
    [credits],
  );

  const pageUrl = `${SITE_URL}/person/${actorId ?? ''}`;
  const pageTitle = actor
    ? `${actor.name} — Movies, TV Shows & Biography | YENI MOVIE`
    : 'Actor Profile | YENI MOVIE';
  const knownForSentence = topKnownFor.length
    ? ` Known for ${topKnownFor.join(', ')}.`
    : '';
  const rawDescription = actor
    ? `${actor.name}${
        actor.place_of_birth ? `, born in ${actor.place_of_birth}` : ''
      }.${knownForSentence}${
        actor.biography ? ` ${actor.biography.replace(/\s+/g, ' ')}` : ''
      }`
    : 'Explore actor and crew biographies on YENI MOVIE.';
  const pageDescription =
    rawDescription.length > 200 ? `${rawDescription.slice(0, 197)}...` : rawDescription;
  const ogImage = actor?.profile_path
    ? `https://image.tmdb.org/t/p/h632${actor.profile_path}`
    : `${SITE_URL}/og-image.png`;

  const structuredData = actor
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: pageUrl,
        mainEntity: {
          '@type': 'Person',
          name: actor.name,
          image: ogImage,
          ...(actor.birthday && { birthDate: actor.birthday }),
          ...(actor.place_of_birth && { birthPlace: actor.place_of_birth }),
          ...(actor.biography && { description: actor.biography }),
          url: pageUrl,
          sameAs: [`https://www.themoviedb.org/person/${actor.id}`],
          knowsAbout: topKnownFor,
        },
      }
    : null;

  if (!actorId || isNaN(actorId)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg rounded-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invalid Person ID</AlertTitle>
          <AlertDescription>
            The ID in the URL is not valid.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large" />

        <meta property="og:type" content="profile" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={actor?.name || 'Actor profile'} />
        <meta property="og:site_name" content="YENI MOVIE" />
        {actor?.name && <meta property="profile:first_name" content={actor.name.split(' ')[0]} />}
        {actor?.name && actor.name.split(' ').length > 1 && (
          <meta
            property="profile:last_name"
            content={actor.name.split(' ').slice(1).join(' ')}
          />
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />

        {structuredData && (
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        )}
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="pt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            className="rounded-full gap-2 h-10 bg-secondary/50 border border-border/40 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {loading && (
          <div className="mt-8 flex flex-col sm:flex-row gap-6">
            <Skeleton className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-9 w-64 rounded-lg" />
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-8 rounded-2xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && actor && (
          <>
            <section className="mt-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
              <Avatar className="h-32 w-32 sm:h-40 sm:w-40 flex-shrink-0 rounded-2xl shadow-lg ring-1 ring-border/50">
                <AvatarImage
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/h632${actor.profile_path}`
                      : undefined
                  }
                  alt={actor.name}
                  className="object-cover rounded-2xl"
                />
                <AvatarFallback className="text-3xl rounded-2xl">
                  {actor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold tracking-tight">
                  {actor.name}
                </h1>

                {(actor.birthday || actor.place_of_birth) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {actor.birthday && (
                      <span className="inline-flex items-center gap-1.5 text-sm bg-secondary/80 border border-border/50 px-2.5 py-1.5 rounded-full text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(actor.birthday).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        <span className="text-muted-foreground/50">·</span>
                        <span className="font-medium text-foreground tabular-nums">{calcAge(actor.birthday)}</span>
                      </span>
                    )}
                    {actor.place_of_birth && (
                      <span className="inline-flex items-center gap-1.5 text-sm bg-secondary/80 border border-border/50 px-2.5 py-1.5 rounded-full text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {actor.place_of_birth}
                      </span>
                    )}
                  </div>
                )}

                {actor.biography ? (
                  <div className="mt-5">
                    <p
                      className={`text-muted-foreground leading-relaxed whitespace-pre-wrap ${
                        expandedBio ? '' : 'line-clamp-4'
                      }`}
                    >
                      {actor.biography}
                    </p>
                    {actor.biography.length > 240 && (
                      <button
                        onClick={() => setExpandedBio((v) => !v)}
                        className="mt-2 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors"
                      >
                        {expandedBio ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="mt-5 text-muted-foreground">
                    No biography available.
                  </p>
                )}
              </div>
            </section>

            <section className="mt-10">
              <ActorMovieCredits
                credits={credits}
                onMovieClick={handleMovieClick}
              />
            </section>

            <section className="mt-2">
              <SimilarPeople people={similarPeople} loading={similarLoading} />
            </section>
          </>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default PersonPage;
