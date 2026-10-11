import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdBanner } from '@/components/AdBanner';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Shield } from 'lucide-react';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const Privacy = () => {
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
        <title>Privacy Policy — YENI MOVIE</title>
        <meta
          name="description"
          content="Read the YENI MOVIE Privacy Policy covering data collection, cookies, advertising, and your rights."
        />
        <link rel="canonical" href="https://yeni-movies.lovable.app/privacy" />
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
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-playfair font-bold tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Introduction</h2>
            <p>
              YENI MOVIE ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you visit our website. Please read this
              privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Information We Collect</h2>
            <p>We may collect information about you in a variety of ways:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">Personal Data:</strong> We do not require personal registration to use our site</li>
              <li><strong className="text-foreground">Usage Data:</strong> Information about how you use our website, pages visited, time spent</li>
              <li><strong className="text-foreground">Device Information:</strong> Browser type, operating system, IP address, device identifiers</li>
              <li><strong className="text-foreground">Cookies and Tracking:</strong> Data collected through cookies and similar technologies</li>
            </ul>
          </section>

          <AdBanner slot="1571190206" className="my-2" />

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Google AdSense and Advertising</h2>
            <p>
              We use Google AdSense to serve advertisements. Google AdSense uses cookies and web beacons to serve ads
              based on your prior visits to our website or other websites.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits</li>
              <li>You may opt out of personalized advertising via{' '}
                <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>
              </li>
              <li>You can also opt out via the{' '}
                <a href="http://www.networkadvertising.org/managing/opt_out.asp" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Network Advertising Initiative</a>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to track activity and hold certain information:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">Essential:</strong> Required for basic website functionality</li>
              <li><strong className="text-foreground">Analytics:</strong> Help us understand how visitors interact with our site</li>
              <li><strong className="text-foreground">Advertising:</strong> Used by Google AdSense for relevant ads</li>
              <li><strong className="text-foreground">Preference:</strong> Remember your settings (e.g. theme)</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Third-Party Services</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">TMDB:</strong> Movie and TV data —{' '}
                <a href="https://www.themoviedb.org/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">privacy policy</a>
              </li>
              <li><strong className="text-foreground">Google AdSense:</strong>{' '}
                <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">privacy policy</a>
              </li>
              <li><strong className="text-foreground">Video players:</strong> External embeds may apply their own policies</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">How We Use Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve and personalize the experience</li>
              <li>Understand and analyze usage</li>
              <li>Serve relevant advertisements</li>
              <li>Detect and prevent fraud and abuse</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Your Rights & Contact</h2>
            <p>
              Depending on your location, you may have rights to access, rectify, delete, or restrict processing of your data,
              and to opt out of personalized advertising.
            </p>
            <p>
              Contact: Telegram{' '}
              <a href="https://t.me/yenimovie" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">@yenimovie</a>
              {' '}· Website contact page
            </p>
          </section>

          <div className="rounded-2xl bg-secondary/50 border border-border/40 p-5 text-xs text-muted-foreground">
            This Privacy Policy is effective as of {lastUpdated}. Changes take effect when posted on this page.
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Privacy;
