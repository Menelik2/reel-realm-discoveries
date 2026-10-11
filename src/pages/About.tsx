import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Film, Users, Target, Heart } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const FEATURES = [
  {
    icon: Film,
    title: 'Comprehensive Database',
    body: 'Access thousands of movies and TV series with detailed information, ratings, cast details, and trailers powered by The Movie Database (TMDB).',
  },
  {
    icon: Users,
    title: 'Community Driven',
    body: "Discover what's trending, popular, and highly rated by the global community of movie and TV enthusiasts.",
  },
  {
    icon: Target,
    title: 'Smart Discovery',
    body: "Advanced filtering by genre, year, and content type helps you find exactly what you're looking for or discover something new.",
  },
  {
    icon: Heart,
    title: 'User Experience',
    body: 'Clean, responsive design that works seamlessly across all devices, from mobile phones to desktop computers.',
  },
];

const About = () => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>About YENI MOVIE — Our Mission & Features</title>
        <meta name="description" content="Learn about YENI MOVIE: our mission, features, and how we help you discover movies and TV series powered by TMDB." />
        <link rel="canonical" href="https://yeni-movies.lovable.app/about" />
      </Helmet>

      <Header
        searchQuery=""
        setSearchQuery={() => {}}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main className="container mx-auto px-4 py-10 max-w-4xl pb-28 md:pb-12">
        <div className="text-center mb-12">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <Film className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-playfair font-bold tracking-tight mb-3">
            About YENI MOVIE
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Your ultimate destination for discovering movies and TV series
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-1.5 tracking-tight">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <AdBanner slot="1571190204" className="my-8" />

        <div className="space-y-8">
          <section className="rounded-2xl border border-border/50 bg-card/50 p-6">
            <h2 className="text-xl font-bold tracking-tight mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              At YENI MOVIE, we believe that great entertainment should be easily discoverable.
              Our mission is to help movie and TV enthusiasts find their next favorite watch
              through comprehensive information, user-friendly design, and powerful search capabilities.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-6">
            <h2 className="text-xl font-bold tracking-tight mb-3">Features</h2>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {[
                'Extensive movie and TV series database',
                'Real-time search with instant results',
                'Detailed cast and crew information',
                'HD trailers and media content',
                'Genre-based filtering and discovery',
                'Responsive design for all devices',
                'Regular content updates',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-6">
            <h2 className="text-xl font-bold tracking-tight mb-3">Data Source</h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              All movie and TV series data is provided by The Movie Database (TMDB),
              a community-built movie and TV database. We're grateful to TMDB and its
              contributors for making this wealth of entertainment information available.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default About;
