const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const PHONO_HOSTS = ["https://phono.cc", "https://phonofilm.net"];

interface Body {
  tmdbId?: string;
  title?: string;
  imdbId?: string;
  year?: string;
  contentId?: number;
}

const normalizeTitle = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

async function fetchJson(url: string, timeoutMs = 8000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "YeniMovie/1.0" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFirstOk(path: string): Promise<unknown> {
  let lastErr: unknown;
  for (const host of PHONO_HOSTS) {
    try {
      return await fetchJson(`${host}${path}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("all hosts failed");
}

function pickBest(
  hits: Array<{
    content_id: number;
    content_type?: string;
    title?: string;
    release_date?: string | null;
    imdb_id?: string | null;
    alternative_titles?: string[];
  }>,
  title: string,
  year?: string,
  imdbId?: string,
) {
  const movies = hits.filter((h) => (h.content_type || "").toUpperCase() === "MOVIE");
  const pool = movies.length ? movies : hits;
  if (!pool.length) return null;

  if (imdbId) {
    const want = imdbId.startsWith("tt") ? imdbId : `tt${imdbId}`;
    const hit = pool.find((h) => h.imdb_id === want);
    if (hit) return hit;
  }

  const target = normalizeTitle(title);
  let best = pool[0];
  let bestScore = -1;
  for (const hit of pool) {
    const names = [hit.title || "", ...(hit.alternative_titles || [])].map(normalizeTitle);
    let score = 0;
    if (names.some((n) => n === target)) score += 100;
    else if (names.some((n) => n.includes(target) || target.includes(n))) score += 40;
    const hitYear = hit.release_date?.slice(0, 4);
    if (year && hitYear) {
      if (hitYear === year) score += 50;
      else if (Math.abs(Number(hitYear) - Number(year)) <= 1) score += 15;
      else score -= 20;
    }
    if (score > bestScore) {
      bestScore = score;
      best = hit;
    }
  }
  return best;
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i <= 2 ? 0 : 1)} ${units[i]}`;
}

function buildFormat(file: Record<string, unknown>): string {
  const parts: string[] = [];
  if (file.source) parts.push(String(file.source));
  if (file.encoder_name) parts.push(String(file.encoder_name));
  if (file.is_hdr) parts.push("HDR");
  const name = String(file.file_name || "").toLowerCase();
  if (/x265|hevc/.test(name)) parts.push("x265");
  else if (/x264/.test(name)) parts.push("x264");
  if (/web-?dl/.test(name)) parts.push("WEB-DL");
  else if (/webrip/.test(name)) parts.push("WEBRip");
  else if (/bluray|blu-ray/.test(name)) parts.push("BluRay");
  return [...new Set(parts)].join(" · ") || "Video";
}

function resolveUrl(file: Record<string, unknown>): string | null {
  const dl = file.download_url;
  if (typeof dl === "string" && /^https?:\/\//i.test(dl)) {
    return dl.replace("telegram.dog", "t.me");
  }
  if (file.message_id != null && String(file.message_id).length > 0) {
    return `https://t.me/phonofilmbot?start=${file.message_id}`;
  }
  return null;
}

function mapFiles(
  payload: Record<string, Record<string, Array<Record<string, unknown>>>>,
  fallbackTitle: string,
) {
  const categories: Record<string, string[]> = {};
  const filesByQuality: Record<string, Array<Record<string, unknown>>> = {};

  const langKeys = Object.keys(payload || {});
  langKeys.sort((a, b) => (a === "English" ? -1 : b === "English" ? 1 : a.localeCompare(b)));

  for (const language of langKeys) {
    const byRes = payload[language] || {};
    for (const [quality, rows] of Object.entries(byRes)) {
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        const url = resolveUrl(row);
        if (!url) continue;
        const sizeBytes = Number(row.file_size_bytes) || 0;
        const file = {
          name: String(row.file_name || `${fallbackTitle} ${quality}`),
          size: formatBytes(sizeBytes),
          sizeBytes,
          url,
          format: buildFormat(row),
          source: row.source ? String(row.source) : undefined,
          encoder: row.encoder_name ? String(row.encoder_name) : undefined,
          quality: String(row.resolution_label || quality),
          language,
          isHdr: !!row.is_hdr,
          messageId: row.message_id != null ? String(row.message_id) : undefined,
          channelId: row.channel_id ?? null,
        };
        if (!filesByQuality[quality]) filesByQuality[quality] = [];
        filesByQuality[quality].push(file);
        if (!categories[quality]) categories[quality] = [];
        categories[quality].push(url);
      }
    }
  }

  const preferred = ["2160p", "1440p", "1080p", "720p", "480p", "360p"];
  for (const q of preferred) {
    if (filesByQuality[q]) {
      filesByQuality[q].sort(
        (a, b) => (Number(b.sizeBytes) || 0) - (Number(a.sizeBytes) || 0),
      );
    }
  }

  return { categories, filesByQuality };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: Body = {};
    if (req.method === "POST") {
      body = await req.json();
    } else {
      const url = new URL(req.url);
      body = {
        tmdbId: url.searchParams.get("tmdbId") || undefined,
        title: url.searchParams.get("title") || undefined,
        imdbId: url.searchParams.get("imdbId") || undefined,
        year: url.searchParams.get("year") || undefined,
        contentId: url.searchParams.get("contentId")
          ? Number(url.searchParams.get("contentId"))
          : undefined,
      };
    }

    const title = (body.title || "").trim();
    let contentId = body.contentId;

    if (!contentId) {
      if (title.length < 1 && !body.imdbId) {
        return new Response(
          JSON.stringify({ success: false, message: "title or contentId required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const q = title || body.imdbId || "";
      const search = (await fetchFirstOk(
        `/svc/api/search?q=${encodeURIComponent(q)}`,
      )) as { results?: Array<Record<string, unknown>> };

      const hits = (search.results || []) as Array<{
        content_id: number;
        content_type?: string;
        title?: string;
        release_date?: string | null;
        imdb_id?: string | null;
        alternative_titles?: string[];
      }>;

      const best = pickBest(hits, title, body.year, body.imdbId);
      if (!best?.content_id) {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              tmdbId: body.tmdbId,
              categories: {},
              filesByQuality: {},
              error: "No matching content found",
            },
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=120",
            },
          },
        );
      }
      contentId = best.content_id;
    }

    const filesPayload = (await fetchFirstOk(
      `/svc/api/content/${contentId}/files`,
    )) as Record<string, Record<string, Array<Record<string, unknown>>>>;

    const mapped = mapFiles(filesPayload, title || "Movie");
    const hasAny = Object.values(mapped.filesByQuality).some((a) => a.length > 0);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          tmdbId: body.tmdbId,
          type: "movie",
          contentId,
          categories: mapped.categories,
          filesByQuality: mapped.filesByQuality,
          ...(hasAny ? {} : { error: "No downloadable files for this title" }),
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=180",
        },
      },
    );
  } catch (err) {
    console.error("phono-download error", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: err instanceof Error ? err.message : "unexpected_error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
