import { Link } from 'react-router-dom';
import { Film, Send, ExternalLink } from 'lucide-react';

const TELEGRAM_CHANNEL = 'https://t.me/yenimovie';

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-secondary/30 mt-auto">
      {/* Prominent Telegram join banner — final section users see */}
      <div className="container mx-auto px-4 pt-8 pb-2">
        <a
          href={TELEGRAM_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #229ED9 0%, #1a7fb8 50%, #0d6a9a 100%)',
            boxShadow: '0 8px 24px rgba(34, 158, 217, 0.35)',
          }}
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-white/5" />

          {/* Telegram icon circle */}
          <div className="relative shrink-0 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white shadow-md">
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9 sm:h-11 sm:w-11 text-[#229ED9]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472z" />
            </svg>
          </div>

          {/* Text */}
          <div className="relative flex-1 text-center sm:text-left text-white">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-white/80 mb-1">
              Official Channel
            </p>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight">
              Join YENI MOVIE on Telegram
            </h3>
            <p className="mt-1 text-sm text-white/90">
              Latest movies, series & updates — free · @yenimovie
            </p>
          </div>

          {/* CTA button */}
          <div className="relative shrink-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#229ED9] shadow-sm transition-transform group-hover:scale-105">
              <Send className="h-4 w-4" />
              Open Channel
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </span>
          </div>
        </a>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Film className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">YENI MOVIE</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your ultimate destination for discovering movies and TV series.
            </p>
            <a
              href={TELEGRAM_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20 text-sm font-medium transition-colors"
            >
              <Send className="h-4 w-4" />
              Join @yenimovie
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[{ to: '/', label: 'Home' }, { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }, { to: '/top-box-office', label: 'Box Office' }].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Follow Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={TELEGRAM_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Telegram Channel
                </a>
              </li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Facebook</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Instagram</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Data Source</h3>
            <p className="text-sm text-muted-foreground">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-block">
              The Movie Database
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} YENI MOVIE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
