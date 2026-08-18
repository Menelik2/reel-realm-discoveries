import { parseSeriesInviteLinks } from '@/api/downloadService';

export interface TelegramResponse {
  invite_link?: string;
  status?: string;
  message?: string;
  success?: boolean;
}

export const fetchTelegramUrl = async (imdbId: string): Promise<string | null> => {
  try {
    console.log('Fetching Telegram URL for IMDb ID:', imdbId);
    
    // Ensure imdbId is properly formatted (should start with 'tt')
    const formattedImdbId = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
    
    const response = await fetch(`https://api.t4tsa.cc/get-series/?imdb_id=${formattedImdbId}`);
    
    if (!response.ok) {
      console.error('Failed to fetch Telegram URL:', response.status, response.statusText);
      return null;
    }
    
    const data: TelegramResponse = await response.json();
    console.log('Telegram API response:', data);
    
    // invite_link is often multi-line season list — pick the first real t.me URL
    if (data.invite_link) {
      const links = parseSeriesInviteLinks(data.invite_link);
      if (links.length > 0) {
        console.log('Found Telegram invite link:', links[0].url);
        return links[0].url;
      }
      // Fallback: first URL in the blob
      const match = data.invite_link.match(/https?:\/\/(?:t\.me|telegram\.dog|telegram\.me)\/[^\s|]+/i);
      if (match) return match[0];
    }
    
    console.log('No Telegram invite link found in response');
    return null;
  } catch (error) {
    console.error('Error fetching Telegram URL:', error);
    return null;
  }
};

export const getTelegramUrlForSeries = async (tmdbId: number, existingImdbId?: string): Promise<string | null> => {
  try {
    let imdbId = existingImdbId;
    
    // If we don't have an IMDb ID, fetch it from TMDB
    if (!imdbId) {
      const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
      
      console.log('Getting IMDb ID for TMDB series:', tmdbId);
      
      // Get external IDs from TMDB
      const externalIdsResponse = await fetch(
        `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids`,
        {
          headers: {
            'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json;charset=utf-8'
          }
        }
      );
      
      if (!externalIdsResponse.ok) {
        console.error('Failed to fetch external IDs from TMDB:', externalIdsResponse.status);
        return null;
      }
      
      const externalIds = await externalIdsResponse.json();
      console.log('TMDB external IDs response:', externalIds);
      
      imdbId = externalIds.imdb_id;
    }
    
    if (!imdbId) {
      console.log('No IMDb ID found for this series');
      return null;
    }
    
    // Now fetch the Telegram URL using the IMDb ID
    return await fetchTelegramUrl(imdbId);
  } catch (error) {
    console.error('Error getting Telegram URL for series:', error);
    return null;
  }
};
