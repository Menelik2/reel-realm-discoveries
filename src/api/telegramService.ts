export interface TelegramResponse {
  invite_link?: string;
  status?: string;
  message?: string;
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
    
    // Extract invite_link if it exists
    if (data.invite_link) {
      console.log('Found Telegram invite link:', data.invite_link);
      return data.invite_link;
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