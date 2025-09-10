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

const TELEGRAM_BOT_BASE = 'https://telegram.dog/Phonofilmbot?start=';

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
      console.log('❌ Direct API failed, trying AllOrigins proxy:', corsError.message);
      
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

export const getDownloadLinks = async (tmdbId: string): Promise<DownloadResult> => {
  return fetchMovieDownloadLinks(tmdbId);
};