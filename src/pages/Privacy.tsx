
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

const Privacy = () => {
  useEffect(() => {
    // Google Ads compatibility
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXXX');
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
          <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
          
          {/* Google Ads Placeholder */}
          <div className="bg-muted p-4 rounded-lg text-center mb-8">
            <p className="text-sm text-muted-foreground">Advertisement</p>
            <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
              <span>Google Ads Placeholder</span>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support. This may include your name, email address, 
                  and usage preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• To provide and maintain our services</li>
                  <li>• To personalize your experience</li>
                  <li>• To communicate with you about our services</li>
                  <li>• To improve our website and services</li>
                  <li>• To comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Ads and Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We use Google Ads and Google Analytics to serve advertisements and analyze website traffic. 
                  Google may use cookies and similar technologies to collect information about your browsing 
                  behavior for advertising purposes. You can opt out of personalized advertising by visiting 
                  Google's Ads Settings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to track activity on our service and 
                  store certain information. You can instruct your browser to refuse all cookies or to 
                  indicate when a cookie is being sent.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at 
                  privacy@cinedb.com or through our contact page.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Another Google Ads Placeholder */}
          <div className="bg-muted p-4 rounded-lg text-center mt-8">
            <p className="text-sm text-muted-foreground">Advertisement</p>
            <div className="h-24 bg-gray-200 rounded flex items-center justify-center">
              <span>Google Ads Banner</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
