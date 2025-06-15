
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';
import { AdBanner } from '@/components/AdBanner';

const Privacy = () => {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                YENI MOVIE collects minimal information to provide you with the best movie and TV series discovery experience. 
                We may collect usage data, preferences, and technical information about your device and browser.
              </p>
            </section>

            <AdBanner slot="1571190202" className="my-8" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">Advertising and Third-Party Services</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We use Google AdSense to display advertisements on our website. Google AdSense uses cookies and similar technologies 
                  to serve ads based on your prior visits to our website or other websites. You may opt out of personalized advertising 
                  by visiting Google's Ads Settings.
                </p>
                <p>
                  Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website. 
                  Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit 
                  to our sites and/or other sites on the Internet.
                </p>
                <p>
                  We also use The Movie Database (TMDB) API to provide movie and TV series information. Please refer to 
                  TMDB's privacy policy for information about their data practices.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website uses cookies to enhance your browsing experience, analyze site traffic, and serve personalized advertisements. 
                You can control cookie settings through your browser preferences. However, disabling cookies may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate security measures to protect your information against unauthorized access, alteration, 
                disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through our contact page or via our 
                official channels. We are committed to addressing your privacy concerns promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Privacy;
