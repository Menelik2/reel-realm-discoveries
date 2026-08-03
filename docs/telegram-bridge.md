# Premium Telegram-to-HTTP download bridge

The app ships the **client + gating half** of the fast-download feature. The streaming
worker itself is external and pluggable.

## How it works

1. Premium user clicks **Fast** in the download modal.
2. `useFastDownload` calls the `bridge-download` edge function with the Telegram
   `message_id` (parsed out of the `t.me/...?start=<id>` deep link).
3. The edge function:
   - requires a valid Supabase session,
   - requires at least one `orders` row with `status = 'paid'` for that user,
   - HMAC-SHA256 signs a short-lived (1 h) token and returns
     `${BRIDGE_URL}/dl/<payloadB64Url>.<signatureB64Url>`.
4. The browser navigates to that URL; the bridge streams the file.

If `BRIDGE_URL` / `BRIDGE_SIGNING_SECRET` are not set, the function returns
`503 bridge_not_configured` and the UI falls back to the Telegram deep link.

## Secrets to set (Supabase Edge Function secrets)

| Name                    | Value                                                     |
| ----------------------- | --------------------------------------------------------- |
| `BRIDGE_URL`            | `https://your-bridge.fly.dev` (no trailing slash)          |
| `BRIDGE_SIGNING_SECRET` | Long random string, shared with the bridge worker          |

## Token format

`GET /dl/<payload>.<signature>`

- `payload` = base64url(JSON): `{ "mid": "<message_id>", "cid": "<channel_id|null>", "fn": "<file name>", "sub": "<user id>", "exp": <unix seconds> }`
- `signature` = base64url(HMAC-SHA256(payload, BRIDGE_SIGNING_SECRET))

The bridge MUST:

1. Recompute the HMAC and compare in constant time; reject on mismatch → `401`.
2. Reject when `exp < now` → `410`.
3. Resolve the Telegram message via **MTProto** (GramJS `StringSession` with
   `TELEGRAM_API_ID` / `TELEGRAM_API_HASH` / `TELEGRAM_SESSION`) — the Bot API
   `getFile` endpoint is hard-capped at 20 MB and cannot be used here.
4. Respond with:
   - `Accept-Ranges: bytes`
   - `Content-Length` (or the `Content-Range` slice length for a `206`)
   - `Content-Disposition: attachment; filename="<fn>"; filename*=UTF-8''<encoded fn>`
   - `Content-Type: application/octet-stream` (or the real MIME type)
5. Honour `Range: bytes=start-end` by seeking with GramJS
   `client.iterDownload({ file, offset, limit, requestSize: 512 * 1024 })` and
   piping chunks into the response stream, so pause/resume and seeking work.

Host it anywhere with raw TCP egress and no request timeout — Fly.io, Railway, or a
plain VPS. Supabase Edge Functions are **not** suitable: their execution window will
cut off multi-gigabyte transfers.
