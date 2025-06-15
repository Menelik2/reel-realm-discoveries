
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';
import { Mail, MessageSquare, Send, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdBanner } from '@/components/AdBanner';

const Contact = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-muted-foreground">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Get in Touch</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">contact@yenimovie.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Send className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Telegram</p>
                      <a 
                        href="https://t.me/medebereya" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        @medebereya
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Website</p>
                      <p className="text-sm text-muted-foreground">yenimovie.lovable.app</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <AdBanner slot="1571190202" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4 text-left max-w-2xl mx-auto">
              <div>
                <h3 className="font-medium mb-2">How often is the content updated?</h3>
                <p className="text-muted-foreground text-sm">
                  Our content is updated daily with the latest information from TMDB, 
                  including new releases, ratings, and cast information.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Can I suggest features or report bugs?</h3>
                <p className="text-muted-foreground text-sm">
                  Absolutely! We welcome all feedback, feature suggestions, and bug reports. 
                  Please use the contact form above or reach out via Telegram.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Is the website free to use?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes, YENI MOVIE is completely free to use. We support our service through 
                  advertising to keep it accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Contact;
