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

export interface DownloadResult {
  tmdbId: string;
  type: 'movie';
  categories: {
    [key: string]: string[];
  };
  error?: string;
}

const DOWNLOAD_API_BASE = 'https://api.allorigins.win/get?url=http%3A//3.122.146.239';
const TELEGRAM_BOT_BASE = 'https://telegram.dog/Phonofilmbot?start=';

export const fetchMovieDownloadLinks = async (tmdbId: string): Promise<DownloadResult> => {
  try {
    // Try direct API first, then fallback to AllOrigins if CORS issues
    let apiUrl = `http://3.122.146.239/get-movie?tmdb_id=${tmdbId}`;
    let response;
    
    console.log('Fetching movie download links for TMDB ID:', tmdbId);
    
    try {
      // Try direct API call first
      console.log('Attempting direct API call:', apiUrl);
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (corsError) {
      // Fallback to AllOrigins proxy if CORS issues
      console.log('Direct API failed, trying AllOrigins proxy:', corsError.message);
      apiUrl = `${DOWNLOAD_API_BASE}/get-movie/%3Ftmdb_id%3D${tmdbId}`;
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
      });
    }
    
    console.log('API Response status:', response.status, 'URL:', apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Raw API response:', responseData);
    
    let data: MovieDownloadResponse;
    
    // Handle AllOrigins response format
    if (responseData.contents) {
      try {
        data = JSON.parse(responseData.contents);
      } catch (parseError) {
        console.error('Failed to parse AllOrigins contents:', parseError);
        throw new Error('Invalid response format from proxy');
      }
    } else {
      data = responseData;
    }
    
    console.log('Parsed movie download data:', data);
    
    const categories: { [key: string]: string[] } = {};

    // Process all quality categories dynamically
    const allCategories = Object.keys(data);
    console.log('Found categories in API response:', allCategories);
    
    // Process each category found in the response
    for (const category of allCategories) {
      const categoryData = data[category];
      
      if (categoryData && Array.isArray(categoryData) && categoryData.length > 0) {
        const messageIds = categoryData
          .filter(item => item && typeof item === 'object' && item.message_id)
          .map(item => `${TELEGRAM_BOT_BASE}${item.message_id}`);
        
        categories[category] = messageIds.length > 0 ? messageIds : ['No message_id found'];
      } else {
        categories[category] = ['No message_id found'];
      }
    }
    
    // Ensure we have standard quality categories even if not in response
    const standardCategories = ['top', '2160p', '1440p', '1080p', '720p', '480p'];
    for (const category of standardCategories) {
      if (!categories[category]) {
        categories[category] = ['No message_id found'];
      }
    }

    return {
      tmdbId,
      type: 'movie',
      categories
    };

  } catch (error) {
    return {
      tmdbId,
      type: 'movie',
      categories: {},
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getDownloadLinks = async (tmdbId: string): Promise<DownloadResult> => {
  return fetchMovieDownloadLinks(tmdbId);
};