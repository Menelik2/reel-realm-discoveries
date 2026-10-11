import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, Send, Globe } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const TELEGRAM_CHANNEL = 'https://t.me/yenimovie';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const FAQS = [
  {
    q: 'How often is the content updated?',
    a: 'Our content is updated daily with the latest information from TMDB, including new releases, ratings, and cast information.',
  },
  {
    q: 'Can I suggest features or report bugs?',
    a: 'Absolutely! We welcome all feedback, feature suggestions, and bug reports. Please reach out via our Telegram channel @yenimovie.',
  },
  {
    q: 'Is the website free to use?',
    a: 'Yes, YENI MOVIE is completely free to use. We support our service through advertising to keep it accessible to everyone.',
  },
];

const Contact = () => {
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
        <title>Contact YENI MOVIE — Get in Touch</title>
        <meta
          name="description"
          content="Contact the YENI MOVIE team via Telegram or email with questions, feedback, or feature requests. Join our channel @yenimovie."
        />
        <link rel="canonical" href="https://yeni-movies.lovable.app/contact" />
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
            <MessageSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-playfair font-bold tracking-tight mb-3">
            Contact Us
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            We'd love to hear from you. Reach out and we'll respond as soon as possible.
          </p>
        </div>

        <div className="max-w-lg mx-auto space-y-6 mb-12">
          <div className="rounded-2xl border border-border/50 bg-card/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#229ED9]/15">
                <Send className="h-5 w-5 text-[#229ED9]" />
              </div>
              <div>
                <p className="font-semibold text-sm">Telegram Channel</p>
                <a
                  href={TELEGRAM_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#229ED9] hover:underline font-medium"
                >
                  @yenimovie — Join now
                </a>
              </div>
            </div>

            <a
              href={TELEGRAM_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#229ED9] text-white font-semibold hover:bg-[#1c8bbd] transition-colors shadow-md shadow-[#229ED9]/25"
            >
              <Send className="h-4 w-4" />
              Open Telegram Channel
            </a>

            <div className="flex items-center gap-3 pt-1 border-t border-border/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Website</p>
                <p className="text-sm text-muted-foreground">yeni-movie.vercel.app</p>
              </div>
            </div>
          </div>

          <AdBanner slot="1571190205" />
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-center mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-border/50 bg-card/50 p-5"
              >
                <h3 className="font-semibold text-sm mb-1.5">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Contact;
