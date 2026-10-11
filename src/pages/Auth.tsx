import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Film, Lock } from 'lucide-react';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const navigate = useNavigate();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully!');
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Enter your email address first.');
      return;
    }
    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        navigate('/reset-confirmation');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        searchQuery=""
        setSearchQuery={() => {}}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      <main className="flex-1 container mx-auto px-4 py-10 flex justify-center items-center pb-28 md:pb-12">
        <Card className="w-full max-w-md rounded-2xl border-border/50 shadow-lg overflow-hidden">
          <CardHeader className="text-center space-y-3 pb-2 pt-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-playfair font-bold tracking-tight">Admin Login</CardTitle>
              <CardDescription className="mt-1.5">
                Enter your credentials to access the admin panel.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-8 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="auth-email">
                  Email
                </label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 rounded-xl bg-secondary/40 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="auth-password">
                  Password
                </label>
                <Input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 rounded-xl bg-secondary/40 border-border/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold shadow-md shadow-primary/20"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground rounded-xl"
                onClick={handleForgotPassword}
                disabled={loading || resetting}
              >
                {resetting ? 'Sending reset link…' : 'Forgot password?'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Film className="h-3.5 w-3.5" />
              YENI MOVIE Admin
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Auth;
