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

/** True if token looks like base64 / base64url (not a pure hex store key). */
const isBase64ish = (token: string): boolean => {
  // Standard or url-safe alphabet, optional padding
  if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(token)) return false;
  // Pure hex (IrisFileStore opaque keys) is valid base64 alphabet but is NOT a batch token.
  // Reject 32-char hex keys early so atob does not emit binary garbage.
  if (/^[0-9a-fA-F]{32}$/.test(token)) return false;
  // Real batch tokens are longer (encoded "get-<big-id>...")
  if (token.replace(/=+$/, '').length < 12) return false;
  return true;
};

/** Decode base64 or base64url to a UTF-8 string; returns null on failure. */
const decodeBase64Token = (token: string): string | null => {
  const attempts = [
    // Prefer url-safe → standard mapping first (PhonoFilm tokens are usually standard b64)
    token.replace(/-/g, '+').replace(/_/g, '/'),
    // Then raw token in case mapping corrupted a rare payload
    token,
  ];

  for (const candidate of attempts) {
    try {
      const normalized = candidate.replace(/=+$/, '');
      const pad =
        normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
      const decoded = atob(normalized + pad);

      // Reject binary / non-printable garbage (hex keys that slip through)
      if (!/^[\x20-\x7E]+$/.test(decoded)) continue;

      return decoded;
    } catch {
      // try next attempt
    }
  }
  return null;
};

/**
 * Parse a decoded IrisFileStore payload into a Telegram message id string.
 * Forms: `get-<id>`, `get-<from>-<to>` (batch range — uses first id).
 */
const messageIdFromDecoded = (decoded: string): string | null => {
  const trimmed = decoded.trim();

  const getMatch = trimmed.match(/^get-(-?\d+)(?:-(-?\d+))?$/i);
  if (getMatch) return getMatch[1];

  if (/^-?\d+$/.test(trimmed)) return trimmed;

  return null;
};

/**
 * Decode IrisFileStore / PhonoFilm `?start=` tokens into a numeric Telegram message id
 * when possible.
 *
 * Supported forms:
 * - Numeric deep links: `?start=123456` (Phonofilmbot movies)
 * - Base64 batch tokens: `?start=Z2V0LTE1NTkz...` → `get-<messageId>` or
 *   `get-<startId>-<endId>` (series file batches). Uses the first numeric id.
 * - Opaque hex keys (e.g. `66f83d25460d4925…`) cannot be resolved client-side — returns null.
 *
 * Message ids are returned as strings (they often exceed Number.MAX_SAFE_INTEGER).
 */
export const extractMessageId = (telegramUrl: string): string | null => {
  if (!telegramUrl) return null;

  const startMatch = telegramUrl.match(/[?&]start=([^&#\s]+)/i);
  if (!startMatch) return null;

  let token: string;
  try {
    token = decodeURIComponent(startMatch[1]).trim();
  } catch {
    // Malformed % sequences — use raw capture
    token = startMatch[1].trim();
  }

  // Strip accidental whitespace / quotes from copied links
  token = token.replace(/^['"]|['"]$/g, '');

  // 1) Plain numeric message id (movies / Phonofilmbot)
  if (/^-?\d+$/.test(token)) {
    return token;
  }

  // 2) Opaque hex store keys — not decodable to a message id
  if (/^[0-9a-fA-F]{32}$/.test(token)) {
    return null;
  }

  // 3) Base64 / base64url batch tokens (`get-<id>` / `get-<from>-<to>`)
  if (!isBase64ish(token)) {
    return null;
  }

  const decoded = decodeBase64Token(token);
  if (!decoded) return null;

  return messageIdFromDecoded(decoded);
};

/** True when this Telegram URL can use the premium Fast Download bridge. */
export const canFastDownload = (telegramUrl: string): boolean =>
  extractMessageId(telegramUrl) !== null;
