const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const UPSTREAM = "https://phonofilm.net/svc/api/franchise";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get("slug") || "").trim().toLowerCase();

    const upstreamUrl = slug
      ? `${UPSTREAM}/${encodeURIComponent(slug)}`
      : UPSTREAM;

    const res = await fetch(upstreamUrl, {
      headers: {
        accept: "application/json",
        "user-agent": "YeniMovie/1.0 (franchise proxy)",
      },
    });

    if (!res.ok) {
      const status = res.status === 404 ? 404 : 502;
      return new Response(
        JSON.stringify({ error: res.status === 404 ? "not_found" : "upstream_error" }),
        {
          status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (err) {
    console.error("phono-franchise error", err);
    return new Response(JSON.stringify({ error: "unexpected_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
