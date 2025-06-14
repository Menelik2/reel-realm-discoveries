
import { Link } from 'react-router-dom';
import { Github, Film, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Film className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">CineDB</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your ultimate destination for movie and TV series discovery.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/" className="block hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/top-box-office" className="block hover:text-primary transition-colors">
                Top Box Office
              </Link>
              <Link to="/about" className="block hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block hover:text-primary transition-colors">
                Contact
              </Link>
              <Link to="/privacy" className="block hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold">Categories</h4>
            <div className="space-y-2 text-sm">
              <Link to="/?genre=action" className="block hover:text-primary transition-colors">
                Action Movies
              </Link>
              <Link to="/?genre=comedy" className="block hover:text-primary transition-colors">
                Comedy
              </Link>
              <Link to="/?genre=drama" className="block hover:text-primary transition-colors">
                Drama
              </Link>
              <Link to="/?genre=horror" className="block hover:text-primary transition-colors">
                Horror
              </Link>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold">Follow Us</h4>
            <div className="flex space-x-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Film className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2024 CineDB. All rights reserved. Movie data provided by TMDB.</p>
        </div>
      </div>
    </footer>
  );
};
