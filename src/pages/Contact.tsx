
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageCircle, Clock, Globe } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
          <h1 className="text-4xl font-bold text-center mb-8">Contact YENI MOVIE</h1>
          
          <AdBanner slot="5471985426" className="mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">support@yenimovie.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-muted-foreground">We respond within 24-48 hours</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-muted-foreground">yeni-movie.vercel.app</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Support</p>
                    <p className="text-muted-foreground">Technical & General Inquiries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input 
                      name="name"
                      placeholder="Your Name" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Input 
                      name="email"
                      type="email" 
                      placeholder="Your Email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Input 
                      name="subject"
                      placeholder="Subject" 
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Textarea 
                      name="message"
                      placeholder="Your Message" 
                      rows={5} 
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <AdBanner slot="5471985426" className="mt-8" />

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Have questions about our movie database or need technical support? 
              We're here to help you discover your next favorite movie or TV series.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
