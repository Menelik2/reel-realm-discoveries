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

async function fetchTrendingContent(): Promise<TMDBMovie[]> {
  const [moviesRes, tvRes] = await Promise.all([
    fetch(`${TMDB_BASE_URL}/trending/movie/day`, {
      headers: {
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }),
    fetch(`${TMDB_BASE_URL}/trending/tv/day`, {
      headers: {
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
  ]);

  const moviesData = await moviesRes.json();
  const tvData = await tvRes.json();

  const movies = (moviesData.results || []).slice(0, 3).map((m: any) => ({
    ...m,
    media_type: 'movie'
  }));
  
  const tvShows = (tvData.results || []).slice(0, 3).map((t: any) => ({
    ...t,
    media_type: 'tv'
  }));

  return [...movies, ...tvShows];
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string, photoUrl?: string): Promise<boolean> {
  try {
    let url: string;
    let body: any;

    if (photoUrl) {
      url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      body = {
        chat_id: chatId,
        photo: photoUrl,
        caption: text,
        parse_mode: 'HTML'
      };
    } else {
      url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      body = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      };
    }

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
    
    console.log('Message sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

function formatContentMessage(content: TMDBMovie, appUrl: string): string {
  const title = content.title || content.name || 'Unknown';
  const type = content.media_type === 'tv' ? '📺 TV Series' : '🎬 Movie';
  const date = content.release_date || content.first_air_date || 'TBA';
  const year = date ? date.split('-')[0] : '';
  const rating = content.vote_average ? `⭐ ${content.vote_average.toFixed(1)}/10` : '';
  const overview = content.overview 
    ? content.overview.length > 200 
      ? content.overview.substring(0, 200) + '...' 
      : content.overview
    : 'No description available.';
  
  const watchUrl = `${appUrl}/${content.media_type}/${content.id}`;
  
  return `${type}

<b>${title}</b> ${year ? `(${year})` : ''}
${rating}

${overview}

🔗 <a href="${watchUrl}">Watch Now</a>`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram credentials');
      return new Response(
        JSON.stringify({ success: false, message: 'Missing Telegram credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // App URL for links
    const APP_URL = 'https://yeni-movies.lovable.app';

    console.log('Fetching trending content from TMDB...');
    const trendingContent = await fetchTrendingContent();
    
    if (trendingContent.length === 0) {
      console.log('No trending content found');
      return new Response(
        JSON.stringify({ success: false, message: 'No trending content found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${trendingContent.length} trending items`);

    // Send header message
    const headerMessage = `🔥 <b>Trending Now on Yeni Movies!</b> 🔥

Here are today's top picks:`;
    
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, headerMessage);
    
    // Small delay between messages
    await new Promise(resolve => setTimeout(resolve, 500));

    let successCount = 0;
    
    // Send each content item
    for (const content of trendingContent) {
      const message = formatContentMessage(content, APP_URL);
      const photoUrl = content.poster_path ? `${TMDB_IMAGE_BASE}${content.poster_path}` : undefined;
      
      const sent = await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, message, photoUrl);
      
      if (sent) {
        successCount++;
      }
      
      // Small delay between posts to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Successfully posted ${successCount}/${trendingContent.length} items to Telegram`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Posted ${successCount} trending items to Telegram`,
        posted: successCount,
        total: trendingContent.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in telegram-auto-post function:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
