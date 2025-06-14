
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Users, Star, Globe, Database, Shield } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';

const About = () => {
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
          <h1 className="text-4xl font-bold text-center mb-8">About YENI MOVIE</h1>
          
          <AdBanner slot="1571190202" className="mb-8" />

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
                  YENI MOVIE is your ultimate destination for discovering movies and TV series. 
                  We provide comprehensive, legal information about entertainment content, 
                  helping you find what to watch next through detailed summaries, ratings, 
                  cast information, and user reviews.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Powered by TMDB
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our platform utilizes The Movie Database (TMDB) API to provide accurate, 
                  up-to-date information about movies and TV series. All content information 
                  is sourced legally and ethically from this comprehensive entertainment database.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Quality Content Discovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We curate high-quality movie and series information including ratings, 
                  cast details, plot summaries, and release information to help you make 
                  informed viewing decisions. No pirated content, just pure discovery.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Global Entertainment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Discover content from around the world with support for multiple languages 
                  and regions. Find hidden gems and international favorites, all through 
                  legitimate streaming service recommendations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Focused
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built for movie enthusiasts by movie enthusiasts. Our platform respects 
                  copyright laws and content creators while providing the best possible 
                  experience for discovering your next favorite entertainment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Legal & Ethical
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  YENI MOVIE operates within legal boundaries, providing only information 
                  about movies and TV shows. We do not host, stream, or distribute copyrighted 
                  content. We respect intellectual property rights.
                </p>
              </CardContent>
            </Card>
          </div>

          <AdBanner slot="1571190202" className="mb-8" />

          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Discover Your Next Favorite</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Whether you're a casual movie watcher or a serious cinephile, 
              YENI MOVIE has something for everyone. Start exploring today and 
              discover detailed information about movies and series from around the world!
            </p>
            <div className="bg-muted/20 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Legal Notice</h3>
              <p className="text-sm text-muted-foreground">
                YENI MOVIE is a movie and TV show information platform. We provide details, 
                ratings, and recommendations but do not host or stream any video content. 
                All streaming should be done through legitimate, licensed platforms.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
