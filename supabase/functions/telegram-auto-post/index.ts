import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: string;
}

interface OMDbData {
  imdbRating?: string;
  imdbVotes?: string;
  Awards?: string;
  BoxOffice?: string;
  Rated?: string;
  Genre?: string;
  Director?: string;
  Metascore?: string;
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

async function fetchTrendingContent(): Promise<TMDBMovie[]> {
  const [moviesData, tvData] = await Promise.all([
    fetchTMDB(`${TMDB_BASE_URL}/trending/movie/day`),
    fetchTMDB(`${TMDB_BASE_URL}/trending/tv/day`)
  ]);

  const movies = (moviesData.results || []).slice(0, 3).map((m: any) => ({ ...m, media_type: 'movie' }));
  const tvShows = (tvData.results || []).slice(0, 3).map((t: any) => ({ ...t, media_type: 'tv' }));
  return [...movies, ...tvShows];
}

async function getIMDbId(tmdbId: number, mediaType: string): Promise<string | null> {
  try {
    const data = await fetchTMDB(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}/external_ids`);
    return data.imdb_id || null;
  } catch {
    return null;
  }
}

async function fetchOMDbData(imdbId: string, apiKey: string): Promise<OMDbData | null> {
  try {
    const res = await fetch(`http://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`);
    const data = await res.json();
    return data.Response === 'True' ? data : null;
  } catch {
    return null;
  }
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string, photoUrl?: string): Promise<boolean> {
  try {
    const url = photoUrl
      ? `https://api.telegram.org/bot${botToken}/sendPhoto`
      : `https://api.telegram.org/bot${botToken}/sendMessage`;

    const body = photoUrl
      ? { chat_id: chatId, photo: photoUrl, caption: text, parse_mode: 'HTML' }
      : { chat_id: chatId, text, parse_mode: 'HTML' };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('Telegram API error:', result);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

function formatContentMessage(content: TMDBMovie, omdb: OMDbData | null, appUrl: string): string {
  const title = content.title || content.name || 'Unknown';
  const type = content.media_type === 'tv' ? '📺 TV Series' : '🎬 Movie';
  const date = content.release_date || content.first_air_date || '';
  const year = date ? date.split('-')[0] : '';

  // Build ratings line
  const ratings: string[] = [];
  if (omdb?.imdbRating && omdb.imdbRating !== 'N/A') {
    ratings.push(`⭐ IMDb: ${omdb.imdbRating}/10`);
  } else if (content.vote_average) {
    ratings.push(`⭐ TMDB: ${content.vote_average.toFixed(1)}/10`);
  }
  if (omdb?.Metascore && omdb.Metascore !== 'N/A') {
    ratings.push(`🟢 Metascore: ${omdb.Metascore}`);
  }

  // Awards
  const awards = omdb?.Awards && omdb.Awards !== 'N/A' ? `\n🏆 ${omdb.Awards}` : '';

  // Box office
  const boxOffice = omdb?.BoxOffice && omdb.BoxOffice !== 'N/A' ? `\n💰 Box Office: ${omdb.BoxOffice}` : '';

  // Genre & Director
  const genre = omdb?.Genre && omdb.Genre !== 'N/A' ? `\n🎭 ${omdb.Genre}` : '';
  const director = omdb?.Director && omdb.Director !== 'N/A' ? `\n🎬 Director: ${omdb.Director}` : '';

  const overview = content.overview
    ? content.overview.length > 150 ? content.overview.substring(0, 150) + '...' : content.overview
    : '';

  const watchUrl = `${appUrl}/${content.media_type}/${content.id}`;

  return `${type}

<b>${title}</b> ${year ? `(${year})` : ''}
${ratings.join(' | ')}${awards}${boxOffice}${genre}${director}

${overview}

🔗 <a href="${watchUrl}">Watch Now on Yeni Movies</a>`;
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

    console.log('Fetching trending content...');
    const trendingContent = await fetchTrendingContent();

    if (trendingContent.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No trending content found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch IMDb IDs and OMDb data in parallel
    const enrichedContent = await Promise.all(
      trendingContent.map(async (item) => {
        let omdb: OMDbData | null = null;
        if (OMDB_API_KEY) {
          const imdbId = await getIMDbId(item.id, item.media_type || 'movie');
          if (imdbId) {
            omdb = await fetchOMDbData(imdbId, OMDB_API_KEY);
          }
        }
        return { item, omdb };
      })
    );

    // Send header
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
      `🔥 <b>Trending Now on Yeni Movies!</b> 🔥\n\nToday's top picks with IMDb ratings & box office data:`
    );
    await new Promise(r => setTimeout(r, 500));

    let successCount = 0;
    for (const { item, omdb } of enrichedContent) {
      const message = formatContentMessage(item, omdb, APP_URL);
      const photoUrl = item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : undefined;
      if (await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, message, photoUrl)) {
        successCount++;
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Posted ${successCount}/${enrichedContent.length} items with OMDb enrichment`);

    return new Response(
      JSON.stringify({ success: true, posted: successCount, total: enrichedContent.length }),
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
