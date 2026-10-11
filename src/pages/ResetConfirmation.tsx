import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const ResetConfirmation = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        searchQuery=""
        setSearchQuery={() => {}}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      <main className="flex-1 container mx-auto px-4 py-10 flex justify-center items-center pb-28 md:pb-12">
        <Card className="w-full max-w-md rounded-2xl border-border/50 shadow-lg overflow-hidden text-center">
          <CardHeader className="space-y-3 pt-8 pb-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Mail className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-playfair font-bold tracking-tight">
              Check your email
            </CardTitle>
            <CardDescription>
              We've sent a password reset link to your inbox. If you don't see it within a few minutes, check spam or junk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-8">
            <ol className="text-sm text-muted-foreground space-y-2.5 text-left list-decimal list-inside rounded-2xl border border-border/40 bg-secondary/30 p-4">
              <li>Open the email from YENI MOVIE.</li>
              <li>Click the reset link inside it.</li>
              <li>Choose a new password on the reset page.</li>
              <li>Sign in with your new password.</li>
            </ol>
            <Button
              type="button"
              className="w-full h-11 rounded-xl font-semibold shadow-md shadow-primary/20"
              onClick={() => navigate('/auth')}
            >
              Back to login
            </Button>
            <p className="text-xs text-muted-foreground">
              The link expires after a limited time. If it expires, request a new one from the login page.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ResetConfirmation;
