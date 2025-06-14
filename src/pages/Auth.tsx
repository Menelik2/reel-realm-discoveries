
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Auth process started. isSigningUp:', isSigningUp);

    try {
      const authMethod = isSigningUp ? supabase.auth.signUp : supabase.auth.signInWithPassword;

      console.log('Calling Supabase auth method...');
      const { error } = await authMethod({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });
      console.log('Supabase auth method returned.');

      if (error) {
        console.error('Supabase auth error:', error);
        toast.error(error.message);
      } else {
        console.log('Supabase auth success.');
        if (isSigningUp) {
          toast.success('Check your email for the confirmation link!');
          setIsSigningUp(false);
        } else {
          toast.success('Logged in successfully!');
          navigate('/admin');
        }
      }
    } catch (err) {
      console.error('An unexpected error occurred during auth:', err);
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      console.log('Setting loading to false in finally block.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery="" setSearchQuery={() => {}} isDarkMode={false} setIsDarkMode={() => {}} />
      <main className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: 'calc(100vh - 200px)'}}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{isSigningUp ? 'Create an Account' : 'Admin Login'}</CardTitle>
            <CardDescription>
              {isSigningUp ? 'Enter your details to create an account.' : 'Enter your credentials to access the admin panel.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Login')}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {isSigningUp ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setIsSigningUp(false)} className="underline hover:text-primary">
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setIsSigningUp(true)} className="underline hover:text-primary">
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
