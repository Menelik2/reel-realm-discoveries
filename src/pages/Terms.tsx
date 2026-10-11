import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdBanner } from '@/components/AdBanner';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { FileText } from 'lucide-react';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const Terms = () => {
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

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Terms of Service — YENI MOVIE</title>
        <meta
          name="description"
          content="Review the YENI MOVIE Terms of Service: acceptable use, intellectual property, advertising, and disclaimers."
        />
        <link rel="canonical" href="https://yeni-movies.lovable.app/terms" />
      </Helmet>

      <Header
        searchQuery=""
        setSearchQuery={() => {}}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main className="container mx-auto px-4 py-10 max-w-3xl pb-28 md:pb-12">
        <div className="mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-playfair font-bold tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Agreement to Terms</h2>
            <p>
              By accessing and using YENI MOVIE, you accept and agree to be bound by these terms.
              If you do not agree, please do not use this service.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Description of Service</h2>
            <p>
              YENI MOVIE provides information about movies and TV series, including ratings, cast,
              trailers, and related discovery tools. Content is sourced from The Movie Database (TMDB)
              and other publicly available sources.
            </p>
          </section>

          <AdBanner slot="1571190207" className="my-2" />

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Acceptable Use</h2>
            <p>You agree to use the site only for lawful purposes and without restricting others' enjoyment.</p>
            <p className="font-medium text-foreground text-sm">Prohibited uses include:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Unauthorized access to any part of the site</li>
              <li>Automated extraction of data without permission</li>
              <li>Disrupting servers or networks</li>
              <li>Unlawful, harmful, or inappropriate content</li>
              <li>Violating applicable laws</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Intellectual Property</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Movie and TV data is provided by TMDB</li>
              <li>Images and posters belong to their respective copyright holders</li>
              <li>Website design and code are proprietary to YENI MOVIE</li>
              <li>Reproduction or redistribution without permission is not allowed</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Disclaimers & Liability</h2>
            <p>
              The service is provided "as is" without warranties. YENI MOVIE is not liable for indirect,
              incidental, special, or consequential damages arising from use of the site.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Advertising</h2>
            <p>
              Ads may be served by Google AdSense and partners. We are not responsible for ad content or
              third-party practices. Clicks may leave our site.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Contact</h2>
            <p>
              Questions about these terms:{' '}
              <a href="https://t.me/yenimovie" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                @yenimovie on Telegram
              </a>
              {' '}or the contact page.
            </p>
          </section>

          <div className="rounded-2xl bg-secondary/50 border border-border/40 p-5 text-xs text-muted-foreground">
            These Terms of Service constitute the entire agreement regarding use of the website. Effective {lastUpdated}.
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Terms;
