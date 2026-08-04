const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();

    if (q.length < 2) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = `https://phonofilm.net/svc/api/search?q=${encodeURIComponent(q)}`;
    const res = await fetch(upstream, {
      headers: { accept: "application/json" },
    });

    if (!res.ok) {
      console.error("upstream search failed", res.status);
      return new Response(JSON.stringify({ results: [], error: "upstream_error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("phono-search error", err);
    return new Response(JSON.stringify({ results: [], error: "unexpected_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
