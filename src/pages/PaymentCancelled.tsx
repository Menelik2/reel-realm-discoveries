
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentCancelled = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center p-8 max-w-md mx-auto bg-card rounded-lg shadow-lg">
        <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          Your payment was not completed. You can try again anytime.
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

export default PaymentCancelled;
