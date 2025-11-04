import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation patterns
const TMDB_ID_PATTERN = /^\d{1,10}$/;
const IMDB_ID_PATTERN = /^tt\d{7,8}$/;
const MAX_TITLE_LENGTH = 500;

interface FetchSeriesRequest {
  tmdbId: string;
  title: string;
  imdbId?: string;
}

// Validation function
function validateInput(tmdbId: string, title: string, imdbId?: string): { valid: boolean; error?: string } {
  if (!tmdbId || !TMDB_ID_PATTERN.test(tmdbId)) {
    return { valid: false, error: 'Invalid TMDB ID format' };
  }
  
  if (!title || title.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: 'Invalid title length' };
  }
  
  if (imdbId && !IMDB_ID_PATTERN.test(imdbId)) {
    return { valid: false, error: 'Invalid IMDb ID format' };
  }
  
  return { valid: true };
}

interface SeriesResponse {
  success: boolean;
  message: string;
  data?: {
    tmdbId: string;
    title: string;
    imdbId?: string;
    fetchedAt: string;
    downloadLinks?: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { tmdbId, title, imdbId }: FetchSeriesRequest = await req.json();

    // Validate inputs
    const validation = validateInput(tmdbId, title, imdbId);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: validation.error || 'Invalid input parameters' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching series: ${title} (TMDB ID: ${tmdbId})`);

    // Get TMDB API token from environment
    const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';

    // Fetch detailed series information from TMDB
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}?append_to_response=external_ids,seasons`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      }
    );

    if (!tmdbResponse.ok) {
      console.error('Failed to fetch from TMDB:', tmdbResponse.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to fetch series information' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const seriesData = await tmdbResponse.json();
    console.log(`Series data fetched for: ${seriesData.name}`);

    // Get IMDb ID if not provided
    const finalImdbId = imdbId || seriesData.external_ids?.imdb_id;

    // Try to fetch from Telegram API
    let telegramLinks: string[] = [];
    if (finalImdbId) {
      try {
        const formattedImdbId = finalImdbId.startsWith('tt') ? finalImdbId : `tt${finalImdbId}`;
        const telegramResponse = await fetch(`https://api.t4tsa.cc/get-series/?imdb_id=${formattedImdbId}`);
        
        if (telegramResponse.ok) {
          const telegramData = await telegramResponse.json();
          
          if (telegramData.invite_link && typeof telegramData.invite_link === 'string') {
            // Check if invite_link contains multiple lines (new format)
            if (telegramData.invite_link.includes('\n')) {
              // Parse multi-line invite_link and extract only Telegram URLs
              const lines = telegramData.invite_link.split('\n');
              telegramLinks = lines
                .map((line: string) => {
                  const match = line.match(/(https:\/\/telegram\.dog\/[^\s]+)/);
                  return match ? match[1] : null;
                })
                .filter((url: string | null) => url !== null);
              
              console.log(`Found ${telegramLinks.length} Telegram URLs from multi-line invite_link`);
            } else {
              // Old format: single URL
              telegramLinks = [telegramData.invite_link];
              console.log(`Using single invite_link URL`);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to fetch Telegram URL:', error);
      }
    }

    // Prepare response data
    const responseData: SeriesResponse = {
      success: true,
      message: `Series "${seriesData.name}" fetched successfully`,
      data: {
        tmdbId,
        title: seriesData.name || title,
        imdbId: finalImdbId,
        fetchedAt: new Date().toISOString(),
        downloadLinks: telegramLinks
      }
    };

    // Log the successful fetch
    console.log(`Successfully processed series fetch for: ${seriesData.name}`);
    console.log(`Number of seasons: ${seriesData.seasons?.length || 0}`);
    console.log(`First air date: ${seriesData.first_air_date}`);
    console.log(`Status: ${seriesData.status}`);

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-series function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});