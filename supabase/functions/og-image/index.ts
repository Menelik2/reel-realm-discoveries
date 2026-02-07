import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const SITE_URL = "https://yeni-movies.lovable.app";

serve(async (req) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Expected path: /og-image/movie/12345 or /og-image/tv/12345
  const contentType = pathParts[1]; // 'movie' or 'tv'
  const id = pathParts[2];
  
  if (!contentType || !id || !['movie', 'tv'].includes(contentType)) {
    return new Response("Invalid request", { status: 400 });
  }

  try {
    // Fetch content details from TMDB using bearer token
    const tmdbUrl = `https://api.themoviedb.org/3/${contentType}/${id}`;
    
    const response = await fetch(tmdbUrl, {
      headers: {
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from TMDB: ${response.status}`);
    }
    
    const data = await response.json();
    
    const title = data.title || data.name || "YENI MOVIE";
    const description = data.overview 
      ? `${data.overview.substring(0, 140)}... Watch ${title} online on YENI MOVIE.`
      : `Watch ${title} online on YENI MOVIE - Your destination for movies and TV series.`;
    
    // Use w780 for poster
    const posterImage = data.poster_path 
      ? `https://image.tmdb.org/t/p/w780${data.poster_path}`
      : `${SITE_URL}/og-image.png`;
    
    const pageUrl = `${SITE_URL}/${contentType}/${id}`;
    const pageTitle = `${title} - Watch ${contentType === 'tv' ? 'TV Series' : 'Movie'} Online | YENI MOVIE`;

    // Return HTML with proper OG meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="video.movie">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${posterImage}">
  <meta property="og:image:width" content="780">
  <meta property="og:image:height" content="1170">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:site_name" content="YENI MOVIE">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${posterImage}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)}">
  
  <!-- Redirect to actual page -->
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
</head>
<body>
  <p>Redirecting to <a href="${pageUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    // Fallback redirect
    return new Response(`<meta http-equiv="refresh" content="0;url=${SITE_URL}">`, {
      headers: { "Content-Type": "text/html" },
    });
  }
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
