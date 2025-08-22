
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
            <p className="text-lg text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                YENI MOVIE ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you visit our website 
                yenimovie.lovable.app (the "Site"). Please read this privacy policy carefully. If you do not agree 
                with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Personal Data:</strong> We do not require personal registration to use our site</li>
                  <li><strong>Usage Data:</strong> Information about how you use our website, pages visited, time spent</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, IP address, device identifiers</li>
                  <li><strong>Cookies and Tracking:</strong> Data collected through cookies and similar technologies</li>
                </ul>
              </div>
            </section>

            <AdBanner slot="1571190202" className="my-8" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">Google AdSense and Advertising</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We use Google AdSense to serve advertisements on our website. Google AdSense uses cookies and web beacons 
                  to serve ads based on your prior visits to our website or other websites on the Internet.
                </p>
                <p>
                  <strong>What this means for you:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website</li>
                  <li>Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our sites and/or other sites on the Internet</li>
                  <li>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a></li>
                  <li>You can also opt out of a third-party vendor's use of cookies by visiting the <a href="http://www.networkadvertising.org/managing/opt_out.asp" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Network Advertising Initiative opt-out page</a></li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We use cookies and similar tracking technologies to track activity on our website and hold certain information.
                </p>
                <p><strong>Types of cookies we use:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong>Advertising Cookies:</strong> Used by Google AdSense to serve relevant advertisements</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. However, disabling cookies may affect the functionality 
                  of our website and the relevance of advertisements shown to you.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Our website integrates with several third-party services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>The Movie Database (TMDB):</strong> Provides movie and TV series data. View their <a href="https://www.themoviedb.org/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">privacy policy</a></li>
                  <li><strong>Google AdSense:</strong> Serves advertisements. View Google's <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">privacy policy</a></li>
                  <li><strong>Video Streaming Services:</strong> External video players may be embedded on our site</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We may use the information we collect about you to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, operate, and maintain our website</li>
                  <li>Improve, personalize, and expand our website</li>
                  <li>Understand and analyze how you use our website</li>
                  <li>Develop new products, services, features, and functionality</li>
                  <li>Serve relevant advertisements through Google AdSense</li>
                  <li>Communicate with you for customer service and support</li>
                  <li>Detect and prevent fraud and abuse</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate security measures to protect your information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the Internet or 
                electronic storage is 100% secure. While we strive to use commercially acceptable means to protect 
                your information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website is not directed to children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you become aware that a child has provided us with personal 
                information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Depending on your location, you may have certain rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The right to access and receive a copy of your personal information</li>
                  <li>The right to rectify or update your personal information</li>
                  <li>The right to delete your personal information</li>
                  <li>The right to restrict processing of your personal information</li>
                  <li>The right to opt-out of personalized advertising</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email: contact@yenimovie.com</li>
                  <li>Telegram: @medebereya</li>
                  <li>Website: yenimovie.lovable.app/contact</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
                this Privacy Policy periodically for any changes.
              </p>
            </section>

            <div className="mt-8 p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Effective Date</h3>
              <p className="text-sm text-muted-foreground">
                This Privacy Policy is effective as of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} and will remain 
                in effect except with respect to any changes in its provisions in the future, which will be in effect 
                immediately after being posted on this page.
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
