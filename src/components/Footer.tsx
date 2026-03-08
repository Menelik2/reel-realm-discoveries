import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { AdBanner } from './AdBanner';

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-secondary/30 mt-auto">
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
              <li><a href="https://t.me/medebereya" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Telegram</a></li>
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
