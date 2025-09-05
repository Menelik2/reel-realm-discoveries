interface MessageIdObject {
  message_id: string;
}

interface MovieDownloadResponse {
  top?: MessageIdObject[];
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
    const apiUrl = `${DOWNLOAD_API_BASE}/get-movie/%3Ftmdb_id%3D${tmdbId}`;
    
    console.log('Fetching movie download links:', { tmdbId, url: apiUrl });
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
    });
    
    console.log('API Response status:', response.status, 'URL:', apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const responseData = await response.json();
    const data: MovieDownloadResponse = responseData.contents ? JSON.parse(responseData.contents) : responseData;
    console.log('Movie download data:', data);
    
    const categories: { [key: string]: string[] } = {};

    // Process each quality category
    const qualityCategories = ['top', '1080p', '720p', '480p'] as const;
    
    for (const category of qualityCategories) {
      const categoryData = data[category];
      
      if (categoryData && Array.isArray(categoryData) && categoryData.length > 0) {
        categories[category] = categoryData
          .filter(item => item.message_id)
          .map(item => `${TELEGRAM_BOT_BASE}${item.message_id}`);
        
        if (categories[category].length === 0) {
          categories[category] = ['No message_id found'];
        }
      } else {
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