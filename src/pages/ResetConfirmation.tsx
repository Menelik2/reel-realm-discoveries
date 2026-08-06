import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useNavigate } from 'react-router-dom';

const ResetConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery="" setSearchQuery={() => {}} isDarkMode={false} setIsDarkMode={() => {}} />
      <main className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Card className="w-full max-w-sm text-center">
          <CardHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-primary"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription className="space-y-2">
              <span className="block">
                We've sent a password reset link to your inbox. If you don't see it within a few minutes, check your spam or junk folder.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="text-sm text-muted-foreground space-y-2 text-left list-decimal list-inside">
              <li>Open the email from Yeni Movies.</li>
              <li>Click the reset link inside it.</li>
              <li>Choose a new password on the reset page.</li>
              <li>Sign in with your new password.</li>
            </ol>
            <Button type="button" className="w-full" onClick={() => navigate('/auth')}>
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
