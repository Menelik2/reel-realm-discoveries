
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';
import { AdBanner } from '@/components/AdBanner';

const Terms = () => {
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
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-lg text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using YENI MOVIE (yenimovie.lovable.app), you accept and agree to be bound by the 
                terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                YENI MOVIE is a web-based platform that provides information about movies and TV series, including but not 
                limited to ratings, cast information, trailers, and reviews. All content is sourced from The Movie Database (TMDB) 
                and other publicly available sources.
              </p>
            </section>

            <AdBanner slot="1571190202" className="my-8" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>You agree to use YENI MOVIE only for lawful purposes and in a way that does not infringe the rights of, 
                restrict or inhibit anyone else's use and enjoyment of the website.</p>
                
                <p><strong>Prohibited uses include:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Attempting to gain unauthorized access to any part of the site</li>
                  <li>Using automated systems to extract data from the website</li>
                  <li>Interfering with or disrupting the website's servers or networks</li>
                  <li>Posting or transmitting any unlawful, harmful, or inappropriate content</li>
                  <li>Violating any applicable local, state, national, or international law</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The content on YENI MOVIE, including but not limited to text, graphics, logos, and software, is protected 
                  by copyright and other intellectual property laws.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Movie and TV data is provided by The Movie Database (TMDB)</li>
                  <li>Images and posters are the property of their respective copyright holders</li>
                  <li>Our website design and code are proprietary to YENI MOVIE</li>
                  <li>Users may not reproduce, distribute, or create derivative works without permission</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                YENI MOVIE is provided "as is" without any representations or warranties, express or implied. We make no 
                representations or warranties in relation to this website or the information and materials provided on this website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall YENI MOVIE, its directors, employees, or agents be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, 
                to understand our practices regarding the collection and use of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Advertising</h2>
              <p className="text-muted-foreground leading-relaxed">
                YENI MOVIE displays advertisements served by Google AdSense and other advertising partners. We are not responsible 
                for the content of advertisements or the practices of advertisers. Clicking on advertisements will redirect you to 
                third-party websites that are not under our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the website. 
                Your continued use of the website after any changes indicates your acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email: contact@yenimovie.com</li>
                  <li>Telegram: @medebereya</li>
                  <li>Website: yenimovie.lovable.app/contact</li>
                </ul>
              </div>
            </section>

            <div className="mt-8 p-6 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                These Terms of Service constitute the entire agreement between you and YENI MOVIE regarding the use of the website.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Terms;
