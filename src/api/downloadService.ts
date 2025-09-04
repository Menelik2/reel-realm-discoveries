interface MessageIdObject {
  message_id: string;
}

interface MovieDownloadResponse {
  top?: MessageIdObject[];
  "2160p"?: MessageIdObject[];
  "1440p"?: MessageIdObject[];
  "1080p"?: MessageIdObject[];
}

interface SeriesDownloadResponse {
  invite_link?: string;
  top?: MessageIdObject[];
  "2160p"?: MessageIdObject[];
  "1440p"?: MessageIdObject[];
  "1080p"?: MessageIdObject[];
}

export interface DownloadResult {
  imdbId: string;
  type: 'movie' | 'series';
  categories: {
    [key: string]: string[] | string;
  };
  error?: string;
}

const DOWNLOAD_API_BASE = 'https://api.t4tsa.cc';
const TELEGRAM_BOT_BASE = 'https://telegram.dog/Phonofilmbot?start=';

export const fetchMovieDownloadLinks = async (imdbId: string): Promise<DownloadResult> => {
  try {
    const response = await fetch(`${DOWNLOAD_API_BASE}/get-movie/?imdb_id=${imdbId}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data: MovieDownloadResponse = await response.json();
    const categories: { [key: string]: string[] } = {};

    // Process each quality category
    const qualityCategories = ['top', '2160p', '1440p', '1080p'] as const;
    
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
      imdbId,
      type: 'movie',
      categories
    };

  } catch (error) {
    return {
      imdbId,
      type: 'movie',
      categories: {},
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const fetchSeriesDownloadLinks = async (imdbId: string): Promise<DownloadResult> => {
  try {
    const response = await fetch(`${DOWNLOAD_API_BASE}/get-series/?imdb_id=${imdbId}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data: SeriesDownloadResponse = await response.json();

    // Check for invite link first
    if (data.invite_link) {
      return {
        imdbId,
        type: 'series',
        categories: {
          'invite_link': data.invite_link
        }
      };
    }

    // If no invite link, process message_id categories like movies
    const categories: { [key: string]: string[] } = {};
    const qualityCategories = ['top', '2160p', '1440p', '1080p'] as const;
    
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
      imdbId,
      type: 'series',
      categories
    };

  } catch (error) {
    return {
      imdbId,
      type: 'series',
      categories: {},
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getDownloadLinks = async (imdbId: string, contentType: 'movie' | 'tv'): Promise<DownloadResult> => {
  if (contentType === 'movie') {
    return fetchMovieDownloadLinks(imdbId);
  } else {
    return fetchSeriesDownloadLinks(imdbId);
  }
};