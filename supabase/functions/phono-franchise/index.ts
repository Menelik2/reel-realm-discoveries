const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const UPSTREAM = "https://phonofilm.net/svc/api/franchise";
const UPSTREAM_TIMEOUT_MS = 10_000;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });

const fetchUpstream = async (url: string): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "YeniMovie/1.0 (franchise proxy)",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get("slug") || "").trim().toLowerCase();

    if (slug && !SLUG_RE.test(slug)) {
      return json({ error: "not_found", message: "Invalid franchise slug" }, 404);
    }

    const upstreamUrl = slug ? `${UPSTREAM}/${encodeURIComponent(slug)}` : UPSTREAM;

    let res: Response;
    try {
      res = await fetchUpstream(upstreamUrl);
    } catch (err) {
      const aborted =
        (err instanceof Error && err.name === "AbortError") ||
        (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError");
      console.error("phono-franchise upstream fetch failed", aborted ? "timeout" : err);
      return json(
        {
          error: aborted ? "timeout" : "upstream_error",
          message: aborted ? "Upstream timed out" : "Upstream request failed",
        },
        502
      );
    }

    if (!res.ok) {
      const status = res.status === 404 ? 404 : 502;
      const code = res.status === 404 ? "not_found" : "upstream_error";
      console.error("phono-franchise upstream status", res.status, upstreamUrl);
      return json({ error: code, status: res.status }, status);
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch (err) {
      console.error("phono-franchise invalid JSON", err);
      return json({ error: "invalid_payload", message: "Upstream returned invalid JSON" }, 502);
    }

    // Light validation before forwarding
    if (slug) {
      if (!data || typeof data !== "object" || typeof (data as { slug?: unknown }).slug !== "string") {
        return json({ error: "invalid_payload", message: "Unexpected franchise shape" }, 502);
      }
    } else if (!Array.isArray(data)) {
      return json({ error: "invalid_payload", message: "Unexpected franchises list shape" }, 502);
    }

    return json(data, 200, { "Cache-Control": "public, max-age=600" });
  } catch (err) {
    console.error("phono-franchise unexpected error", err);
    return json({ error: "unexpected_error" }, 500);
  }
});
