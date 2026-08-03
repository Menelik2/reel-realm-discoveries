import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const encodeJson = (obj: unknown) => b64url(new TextEncoder().encode(JSON.stringify(obj)));

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const BRIDGE_URL = Deno.env.get('BRIDGE_URL');
    const BRIDGE_SIGNING_SECRET = Deno.env.get('BRIDGE_SIGNING_SECRET');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'unauthorized', message: 'Sign in required' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return json({ error: 'unauthorized', message: 'Sign in required' }, 401);

    // Premium check: any paid order for this user
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: orders, error: orderErr } = await admin
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .limit(1);

    if (orderErr) {
      console.error('orders lookup failed:', orderErr.message);
      return json({ error: 'lookup_failed', message: orderErr.message }, 500);
    }
    if (!orders || orders.length === 0) {
      return json({ error: 'premium_required', message: 'Fast Download is a premium feature.' }, 403);
    }

    if (!BRIDGE_URL || !BRIDGE_SIGNING_SECRET) {
      return json(
        {
          error: 'bridge_not_configured',
          message: 'The download bridge is not connected yet. Use the Telegram link for now.',
        },
        503,
      );
    }

    const body = await req.json().catch(() => ({}));
    const messageId = String(body.messageId ?? '').trim();
    const channelId = body.channelId ? String(body.channelId).trim() : null;
    const fileName = String(body.fileName ?? 'download').slice(0, 200);

    if (!messageId || !/^-?\d+$/.test(messageId)) {
      return json({ error: 'bad_request', message: 'A valid messageId is required' }, 400);
    }
    if (channelId && !/^-?\d+$/.test(channelId)) {
      return json({ error: 'bad_request', message: 'Invalid channelId' }, 400);
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
    const payload = encodeJson({ mid: messageId, cid: channelId, fn: fileName, sub: user.id, exp });
    const signature = await sign(payload, BRIDGE_SIGNING_SECRET);

    const base = BRIDGE_URL.replace(/\/+$/, '');
    const url = `${base}/dl/${payload}.${signature}`;

    return json({ url, expiresAt: exp, fileName });
  } catch (err) {
    console.error('bridge-download error:', err);
    return json({ error: 'internal_error', message: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});
