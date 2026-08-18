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

/**
 * Decode IrisFileStore / PhonoFilm `?start=` tokens into a numeric Telegram message id
 * when possible.
 *
 * Supported forms:
 * - Numeric deep links: `?start=123456` (Phonofilmbot movies)
 * - Base64 batch tokens: `?start=Z2V0LTE1NTkz...` → decodes to `get-<messageId>` or
 *   `get-<startId>-<endId>` (series file batches). Uses the first numeric id.
 * - Opaque hex keys (e.g. `66f83d25460d4925…`) cannot be resolved client-side — returns null.
 */
export const extractMessageId = (telegramUrl: string): string | null => {
  if (!telegramUrl) return null;

  const startMatch = telegramUrl.match(/[?&]start=([^&#\s]+)/i);
  if (!startMatch) return null;

  let token = decodeURIComponent(startMatch[1]).trim();

  // 1) Plain numeric message id (movies / Phonofilmbot)
  if (/^-?\d+$/.test(token)) {
    return token;
  }

  // 2) Base64 / base64url payload used by IrisFileStore bots for series batches
  try {
    const normalized = token.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    const decoded = atob(normalized + pad);

    // `get-<messageId>` or `get-<fromId>-<toId>`
    const getMatch = decoded.match(/^get-(-?\d+)(?:-(-?\d+))?$/i);
    if (getMatch) {
      return getMatch[1];
    }

    // Any other decoded string that is purely numeric
    if (/^-?\d+$/.test(decoded.trim())) {
      return decoded.trim();
    }
  } catch {
    // not valid base64 — fall through
  }

  // 3) Opaque store keys (hex UUID-like) — Fast Download bridge needs a real message id
  return null;
};

/** True when this Telegram URL can use the premium Fast Download bridge. */
export const canFastDownload = (telegramUrl: string): boolean =>
  extractMessageId(telegramUrl) !== null;
