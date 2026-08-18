interface MessageIdObject {
  message_id: string;
}

interface MovieDownloadResponse {
  [key: string]: MessageIdObject[] | undefined;
  top?: MessageIdObject[];
  "2160p"?: MessageIdObject[];
  "1440p"?: MessageIdObject[];
  "1080p"?: MessageIdObject[];
  "720p"?: MessageIdObject[];
  "480p"?: MessageIdObject[];
}

export interface SeriesDownloadLink {
  label: string;
  url: string;
}

export interface DownloadResult {
  tmdbId: string;
  type: 'movie' | 'tv';
  categories?: {
    [key: string]: string[];
  };
  downloadLinks?: SeriesDownloadLink[];
  error?: string;
}


const TELEGRAM_BOT_BASE = 'https://telegram.dog/Phonofilmbot?start=';

/** Extract every Telegram URL from invite_link text (supports multi-link lines with |). */
export const parseSeriesInviteLinks = (inviteLink: string): SeriesDownloadLink[] => {
  if (!inviteLink || typeof inviteLink !== 'string') return [];

  const urlRegex = /(https?:\/\/(?:t\.me|telegram\.dog|telegram\.me)\/[^\s|]+)/gi;
  const links: SeriesDownloadLink[] = [];

  for (const rawLine of inviteLink.split(/\n+/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const matches = [...line.matchAll(urlRegex)];
    if (matches.length === 0) continue;

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const url = match[1];
      const prevEnd = i > 0 ? (matches[i - 1].index! + matches[i - 1][0].length) : 0;
      let label = line.substring(prevEnd, match.index!).trim();
      label = label.replace(/[-–—:|]+\s*$/g, '').replace(/^[-–—:|]+\s*/g, '').trim();
      if (!label) label = 'Download';
      links.push({ label, url });
    }
  }

  return links;
};

const fetchSeriesLinksDirect = async (imdbId: string): Promise<SeriesDownloadLink[]> => {
  const formattedImdbId = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
  const directApiUrl = `https://api.t4tsa.cc/get-series/?imdb_id=${formattedImdbId}`;

  let data: { success?: boolean; invite_link?: string; message?: string };

  try {
    const response = await fetch(directApiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Series API status ${response.status}`);
    }
    data = await response.json();
  } catch (directError) {
    console.log('Direct series API failed, trying AllOrigins proxy:', directError);
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(directApiUrl)}`;
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Proxy series API status ${response.status}`);
    }
    const responseData = await response.json();
    if (!responseData.contents) {
      throw new Error('No contents in proxy response');
    }
    data = JSON.parse(responseData.contents);
  }

  if (!data?.invite_link) {
    return [];
  }
  return parseSeriesInviteLinks(data.invite_link);
};

const resolveSeriesImdbId = async (tmdbId: string, existingImdbId?: string): Promise<string | undefined> => {
  if (existingImdbId) {
    return existingImdbId.startsWith('tt') ? existingImdbId : `tt${existingImdbId}`;
  }

  try {
    const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      }
    );
    if (!response.ok) return undefined;
    const externalIds = await response.json();
    return externalIds.imdb_id || undefined;
  } catch (error) {
    console.warn('Failed to resolve IMDb ID for series:', error);
    return undefined;
  }
};

export const fetchMovieDownloadLinks = async (tmdbId: string): Promise<DownloadResult> => {
  try {
    console.log('🔍 Fetching movie download links for TMDB ID:', tmdbId);
    
    // Try direct API call first  
    const directApiUrl = `https://api.t4tsa.cc/get-movie/?tmdb_id=${tmdbId}`;
    console.log('📡 Attempting direct API call:', directApiUrl);
    
    let response;
    let data: MovieDownloadResponse;
    
    try {
      response = await fetch(directApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Direct API Response status:', response.status);
      
      if (response.ok) {
        data = await response.json();
        console.log('📦 Direct API response data:', data);
      } else {
        throw new Error(`Direct API failed with status: ${response.status}`);
      }
    } catch (corsError) {
      console.log('❌ Direct API failed, trying AllOrigins proxy:', (corsError as Error).message);
      
      // Fallback to AllOrigins proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(directApiUrl)}`;
      console.log('🔄 Proxy URL:', proxyUrl);
      
      response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔄 Proxy Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Proxy API failed with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('📦 Proxy response data:', responseData);
      
      if (responseData.contents) {
        try {
          data = JSON.parse(responseData.contents);
          console.log('📦 Parsed proxy contents:', data);
        } catch (parseError) {
          console.error('❌ Failed to parse proxy contents:', parseError);
          throw new Error('Invalid response format from proxy');
        }
      } else {
        throw new Error('No contents in proxy response');
      }
    }
    
    // Process the response data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format');
    }
    
    const categories: { [key: string]: string[] } = {};
    
    // Process all quality categories dynamically
    const allCategories = Object.keys(data);
    console.log('📋 Found categories in API response:', allCategories);
    
    // Process each category found in the response
    for (const category of allCategories) {
      const categoryData = data[category];
      console.log(`🔍 Processing category "${category}":`, categoryData);
      
      if (categoryData && Array.isArray(categoryData) && categoryData.length > 0) {
        const messageIds = categoryData
          .filter(item => item && typeof item === 'object' && item.message_id)
          .map(item => {
            console.log(`🎬 Found message_id for ${category}:`, item.message_id);
            return `${TELEGRAM_BOT_BASE}${item.message_id}`;
          });
        
        categories[category] = messageIds.length > 0 ? messageIds : ['No links available'];
        console.log(`✅ Category "${category}" processed:`, categories[category]);
      } else {
        categories[category] = ['No links available'];
        console.log(`❌ No valid data for category "${category}"`);
      }
    }
    
    // Ensure we have standard quality categories even if not in response
    const standardCategories = ['top', '2160p', '1440p', '1080p', '720p', '480p'];
    for (const category of standardCategories) {
      if (!categories[category]) {
        categories[category] = ['No links available'];
        console.log(`➕ Added missing category "${category}" with no links`);
      }
    }

    console.log('✅ Final processed categories:', categories);

    return {
      tmdbId,
      type: 'movie',
      categories
    };

  } catch (error) {
    console.error('❌ Download service error:', error);
    return {
      tmdbId,
      type: 'movie',
      categories: {
        'top': ['API Error - Please try again'],
        '1080p': ['API Error - Please try again'],
        '720p': ['API Error - Please try again'],
        '480p': ['API Error - Please try again']
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const fetchSeriesDownloadLinks = async (tmdbId: string, title: string, imdbId?: string): Promise<DownloadResult> => {
  try {
    console.log('🔍 Fetching TV series download links for TMDB ID:', tmdbId);

    // Prefer Supabase edge function (server-side, no CORS)
    try {
      const { supabase } = await import('@/integrations/supabase/client');

      const { data, error } = await supabase.functions.invoke('fetch-series', {
        body: {
          tmdbId,
          title,
          imdbId
        }
      });

      if (!error && data?.success) {
        const links = data.data?.downloadLinks || [];
        console.log('✅ Series data from edge function:', links.length, 'links');
        return {
          tmdbId,
          type: 'tv',
          downloadLinks: links,
        };
      }

      console.warn('Edge function series fetch failed, falling back to client:', error?.message || data?.message);
    } catch (edgeError) {
      console.warn('Edge function invoke error, falling back to client:', edgeError);
    }

    // Client-side fallback (direct API + proxy), same parsing as edge function
    const resolvedImdb = await resolveSeriesImdbId(tmdbId, imdbId);
    if (!resolvedImdb) {
      return {
        tmdbId,
        type: 'tv',
        downloadLinks: [],
        error: 'No IMDb ID found for this series — cannot fetch download links',
      };
    }

    const downloadLinks = await fetchSeriesLinksDirect(resolvedImdb);
    console.log('✅ Series links from client fallback:', downloadLinks.length);

    return {
      tmdbId,
      type: 'tv',
      downloadLinks,
      ...(downloadLinks.length === 0
        ? { error: 'No download links available for this series' }
        : {}),
    };

  } catch (error) {
    console.error('❌ Series download service error:', error);
    return {
      tmdbId,
      type: 'tv',
      downloadLinks: [],
      error: error instanceof Error ? error.message : 'Failed to fetch series download links'
    };
  }
};

export const getDownloadLinks = async (tmdbId: string, contentType?: 'movie' | 'tv', title?: string, imdbId?: string): Promise<DownloadResult> => {
  if (contentType === 'tv') {
    return fetchSeriesDownloadLinks(tmdbId, title || 'Unknown Series', imdbId);
  }
  return fetchMovieDownloadLinks(tmdbId);
};
