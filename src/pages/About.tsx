
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Users, Star, Globe } from 'lucide-react';
import { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    // Google Ads compatibility - inject ads script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXXX'); // Replace with your AdSense ID
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery=""
        setSearchQuery={() => {}}
        isDarkMode={false}
        setIsDarkMode={() => {}}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">About CineDB</h1>
          
          {/* Google Ads Placeholder */}
          <div className="bg-muted p-4 rounded-lg text-center mb-8">
            <p className="text-sm text-muted-foreground">Advertisement</p>
            {/* Replace with actual Google Ads code */}
            <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
              <span>Google Ads Placeholder</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  CineDB is your ultimate destination for discovering movies and TV series. 
                  We provide comprehensive information about your favorite films and shows, 
                  helping you find what to watch next.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Driven
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built for movie enthusiasts by movie enthusiasts. Our platform 
                  combines data from TMDB to bring you accurate and up-to-date 
                  information about movies and series worldwide.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Quality Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We curate high-quality movie and series information including 
                  ratings, cast details, trailers, and reviews to help you make 
                  informed viewing decisions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Global Reach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Discover content from around the world with support for 
                  multiple languages and regions. Find hidden gems and 
                  international favorites all in one place.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Another Google Ads Placeholder */}
          <div className="bg-muted p-4 rounded-lg text-center mb-8">
            <p className="text-sm text-muted-foreground">Advertisement</p>
            <div className="h-24 bg-gray-200 rounded flex items-center justify-center">
              <span>Google Ads Banner</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're a casual movie watcher or a serious cinephile, 
              CineDB has something for everyone. Start exploring today and 
              discover your next favorite movie or series!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
