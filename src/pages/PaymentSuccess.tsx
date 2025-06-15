
import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sessionId) {
      supabase.functions.invoke('verify-payment-session', {
        body: { session_id: sessionId },
      }).then(() => {
        // Invalidate queries to refetch data, like ad-free status
        queryClient.invalidateQueries({ queryKey: ['ad-free-status'] });
      });
    }
  }, [sessionId, queryClient]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center p-8 max-w-md mx-auto bg-card rounded-lg shadow-lg">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. You can now enjoy an ad-free experience.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
