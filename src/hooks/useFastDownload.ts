import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface FastDownloadRequest {
  messageId: string;
  channelId?: string | null;
  fileName?: string;
}

/**
 * Requests a short-lived signed URL from the premium Telegram-to-HTTP bridge.
 * The bridge streams the Telegram file over a range-capable HTTP response, so the
 * browser downloads it directly without opening the Telegram app.
 */
export const useFastDownload = () => {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const start = async ({ messageId, channelId, fileName }: FastDownloadRequest) => {
    setPendingId(messageId);
    try {
      const { data, error } = await supabase.functions.invoke('bridge-download', {
        body: { messageId, channelId: channelId ?? null, fileName },
      });

      if (error) {
        let details = error.message;
        let parsed: { error?: string; message?: string } | null = null;
        if (error instanceof FunctionsHttpError) {
          details = await error.context.text();
          try {
            parsed = JSON.parse(details);
          } catch {
            /* keep raw text */
          }
        }
        console.error('bridge-download failed:', details);

        if (parsed?.error === 'unauthorized') {
          toast.error('Sign in required', { description: 'Log in to use Fast Download.' });
        } else if (parsed?.error === 'premium_required') {
          toast.error('Premium required', {
            description: 'Fast Download in the browser is available to premium members.',
          });
        } else if (parsed?.error === 'bridge_not_configured') {
          toast.error('Fast Download unavailable', {
            description: parsed.message ?? 'The download bridge is not connected yet.',
          });
        } else {
          toast.error('Fast Download failed', { description: parsed?.message ?? details });
        }
        return;
      }

      if (!data?.url) {
        toast.error('Fast Download failed', { description: 'No download URL returned.' });
        return;
      }

      // Navigating triggers the browser download; the bridge sets Content-Disposition.
      window.location.assign(data.url as string);
      toast.success('Download started', { description: fileName ?? 'Your file is downloading.' });
    } catch (err) {
      console.error('bridge-download exception:', err);
      toast.error('Fast Download failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setPendingId(null);
    }
  };

  return { start, pendingId, isPending: (id: string) => pendingId === id };
};

/** Extracts the Telegram message id from a `?start=` deep link. */
export const extractMessageId = (telegramUrl: string): string | null => {
  const match = telegramUrl.match(/[?&]start=(-?\d+)/);
  return match ? match[1] : null;
};
