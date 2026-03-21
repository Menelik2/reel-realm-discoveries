import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface OMDbData {
  imdbRating?: string;
  BoxOffice?: string;
  Awards?: string;
  Genre?: string;
  Director?: string;
  Rated?: string;
  Response?: string;
}

async function fetchTMDB(url: string) {
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  return res.json();
}

async function fetchOMDb(imdbId: string, apiKey: string): Promise<OMDbData | null> {
  try {
    const res = await fetch(`http://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`);
    const data = await res.json();
    return data.Response === 'True' ? data : null;
  } catch { return null; }
}

async function getIMDbId(tmdbId: number): Promise<string | null> {
  try {
    const data = await fetchTMDB(`${TMDB_BASE_URL}/movie/${tmdbId}/external_ids`);
    return data.imdb_id || null;
  } catch { return null; }
}

async function sendTelegram(botToken: string, chatId: string, text: string, photoUrl?: string): Promise<boolean> {
  try {
    const url = photoUrl
      ? `https://api.telegram.org/bot${botToken}/sendPhoto`
      : `https://api.telegram.org/bot${botToken}/sendMessage`;
    const body = photoUrl
      ? { chat_id: chatId, photo: photoUrl, caption: text, parse_mode: 'HTML' }
      : { chat_id: chatId, text, parse_mode: 'HTML' };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await res.json();
    return result.ok === true;
  } catch { return false; }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    const OMDB_API_KEY = Deno.env.get('OMDB_API_KEY');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing Telegram credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const APP_URL = 'https://yeni-movie.vercel.app';

    // Fetch now playing movies (closest to box office data from TMDB)
    const nowPlayingData = await fetchTMDB(`${TMDB_BASE_URL}/movie/now_playing?page=1`);
    const movies = (nowPlayingData.results || []).slice(0, 10);

    if (movies.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No movies found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enrich all 10 movies with OMDb data in parallel
    const enriched = await Promise.all(
      movies.map(async (movie: any) => {
        let omdb: OMDbData | null = null;
        if (OMDB_API_KEY) {
          const imdbId = await getIMDbId(movie.id);
          if (imdbId) omdb = await fetchOMDb(imdbId, OMDB_API_KEY);
        }
        return { movie, omdb };
      })
    );

    // Sort by box office if available, otherwise by popularity
    enriched.sort((a, b) => {
      const boxA = a.omdb?.BoxOffice ? parseInt(a.omdb.BoxOffice.replace(/[$,]/g, '')) || 0 : 0;
      const boxB = b.omdb?.BoxOffice ? parseInt(b.omdb.BoxOffice.replace(/[$,]/g, '')) || 0 : 0;
      if (boxA && boxB) return boxB - boxA;
      return (b.movie.popularity || 0) - (a.movie.popularity || 0);
    });

    // Send header message
    const weekDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    await sendTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
      `🎬💰 <b>Weekly Box Office Top 10</b> 💰🎬\n\n📅 Week of ${weekDate}\n\nHere are the top movies at the box office this week:`
    );
    await new Promise(r => setTimeout(r, 500));

    let successCount = 0;

    for (let i = 0; i < enriched.length; i++) {
      const { movie, omdb } = enriched[i];
      const rank = i + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      const title = movie.title || 'Unknown';
      const year = movie.release_date ? movie.release_date.split('-')[0] : '';

      const lines: string[] = [];
      lines.push(`${medal} <b>${title}</b> ${year ? `(${year})` : ''}`);

      if (omdb?.BoxOffice && omdb.BoxOffice !== 'N/A') lines.push(`💰 Box Office: ${omdb.BoxOffice}`);
      if (omdb?.imdbRating && omdb.imdbRating !== 'N/A') lines.push(`⭐ IMDb: ${omdb.imdbRating}/10`);
      if (omdb?.Rated && omdb.Rated !== 'N/A') lines.push(`📋 Rated: ${omdb.Rated}`);
      if (omdb?.Genre && omdb.Genre !== 'N/A') lines.push(`🎭 ${omdb.Genre}`);
      if (omdb?.Director && omdb.Director !== 'N/A') lines.push(`🎬 Dir: ${omdb.Director}`);
      if (omdb?.Awards && omdb.Awards !== 'N/A') lines.push(`🏆 ${omdb.Awards}`);

      const overview = movie.overview
        ? movie.overview.length > 120 ? movie.overview.substring(0, 120) + '...' : movie.overview
        : '';
      if (overview) lines.push(`\n${overview}`);

      lines.push(`\n🔗 <a href="${APP_URL}/movie/${movie.id}">Watch Now</a>`);

      const photoUrl = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : undefined;
      if (await sendTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, lines.join('\n'), photoUrl)) {
        successCount++;
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Box office: posted ${successCount}/${enriched.length}`);

    return new Response(
      JSON.stringify({ success: true, posted: successCount, total: enriched.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
