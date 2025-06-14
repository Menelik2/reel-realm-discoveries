
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdBanner } from '@/components/AdBanner';

const Privacy = () => {
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
          <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
          <p className="text-center text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <AdBanner slot="1571190202" className="mb-8" />

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    YENI MOVIE collects information to provide better services to our users. We collect information in the following ways:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-4">
                    <li>• <strong>Usage Data:</strong> Information about how you use our website, including pages visited, time spent, and interactions</li>
                    <li>• <strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                    <li>• <strong>Cookies:</strong> Small data files stored on your device to improve your experience</li>
                    <li>• <strong>Search Queries:</strong> Movie and TV show searches to improve our recommendation system</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Provide and maintain our movie discovery services</li>
                  <li>• Personalize content recommendations based on your preferences</li>
                  <li>• Analyze website performance and user behavior to improve our services</li>
                  <li>• Communicate important updates about our services</li>
                  <li>• Ensure website security and prevent fraud</li>
                  <li>• Comply with legal obligations and protect our rights</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Ads and Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    YENI MOVIE uses Google AdSense to display advertisements and Google Analytics to understand how visitors use our site.
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-4">
                    <li>• Google may use cookies to serve ads based on your visits to our site and other sites</li>
                    <li>• You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a></li>
                    <li>• Google Analytics helps us understand site usage patterns while maintaining user anonymity</li>
                    <li>• For more information, visit <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cookies and Tracking Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    We use cookies and similar technologies to enhance your browsing experience:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-4">
                    <li>• <strong>Essential Cookies:</strong> Required for basic website functionality</li>
                    <li>• <strong>Analytics Cookies:</strong> Help us understand how you use our website</li>
                    <li>• <strong>Advertising Cookies:</strong> Used to display relevant ads</li>
                    <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  </ul>
                  <p className="text-muted-foreground">
                    You can control cookies through your browser settings, but disabling them may affect website functionality.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Security and Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    We implement appropriate security measures to protect your information:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-4">
                    <li>• HTTPS encryption for all data transmission</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Limited access to personal information</li>
                    <li>• Data retention only for as long as necessary</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    YENI MOVIE integrates with the following third-party services:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-4">
                    <li>• <strong>The Movie Database (TMDB):</strong> For movie and TV show information</li>
                    <li>• <strong>Google AdSense:</strong> For displaying advertisements</li>
                    <li>• <strong>Google Analytics:</strong> For website analytics</li>
                    <li>• <strong>Vercel:</strong> For website hosting and deployment</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Each service has its own privacy policy governing the use of your information.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You have the following rights regarding your personal information:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-4">
                    <li>• <strong>Access:</strong> Request access to your personal information</li>
                    <li>• <strong>Correction:</strong> Request correction of inaccurate information</li>
                    <li>• <strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li>• <strong>Opt-out:</strong> Opt out of certain data processing activities</li>
                    <li>• <strong>Portability:</strong> Request transfer of your data to another service</li>
                  </ul>
                  <p className="text-muted-foreground">
                    To exercise these rights, please contact us at support@yenimovie.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  YENI MOVIE is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If you believe we have collected information 
                  from a child under 13, please contact us immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                  Your continued use of YENI MOVIE after any changes constitutes acceptance of the new Privacy Policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Email:</strong> support@yenimovie.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Website:</strong> yeni-movie.vercel.app
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <AdBanner slot="1571190202" className="mt-8" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
