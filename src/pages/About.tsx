
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';
import { Film, Users, Target, Heart } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';

const About = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground transition-colors">
        <Header 
          searchQuery=""
          setSearchQuery={() => {}}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About YENI MOVIE</h1>
            <p className="text-xl text-muted-foreground">
              Your ultimate destination for discovering movies and TV series
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Film className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Comprehensive Database</h3>
                  <p className="text-muted-foreground">
                    Access thousands of movies and TV series with detailed information, ratings, 
                    cast details, and trailers powered by The Movie Database (TMDB).
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Users className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
                  <p className="text-muted-foreground">
                    Discover what's trending, popular, and highly rated by the global community 
                    of movie and TV enthusiasts.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Target className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Smart Discovery</h3>
                  <p className="text-muted-foreground">
                    Advanced filtering by genre, year, and content type helps you find exactly 
                    what you're looking for or discover something new.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Heart className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">User Experience</h3>
                  <p className="text-muted-foreground">
                    Clean, responsive design that works seamlessly across all devices, 
                    from mobile phones to desktop computers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AdBanner slot="1571190202" className="my-8" />

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                At YENI MOVIE, we believe that great entertainment should be easily discoverable. 
                Our mission is to help movie and TV enthusiasts find their next favorite watch 
                through comprehensive information, user-friendly design, and powerful search capabilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Extensive movie and TV series database</li>
                <li>• Real-time search with instant results</li>
                <li>• Detailed cast and crew information</li>
                <li>• HD trailers and media content</li>
                <li>• Genre-based filtering and discovery</li>
                <li>• Responsive design for all devices</li>
                <li>• Regular content updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Source</h2>
              <p className="text-muted-foreground leading-relaxed">
                All movie and TV series data is provided by The Movie Database (TMDB), 
                a community-built movie and TV database. We're grateful to TMDB and its 
                contributors for making this wealth of entertainment information available.
              </p>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default About;
