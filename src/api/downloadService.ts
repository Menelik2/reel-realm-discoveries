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

interface TylerMoviesQuality {
  id: string;
  name: string;
  size: string;
}

interface TylerMoviesResponse {
  success: boolean;
  data?: {
    qualities?: {
      "720p"?: TylerMoviesQuality;
      [key: string]: any;
    };
  };
}

export interface DirectDownload {
  url: string;
  filename: string;
  size: string;
  quality: string;
}

export interface DownloadResult {
  tmdbId: string;
  type: 'movie' | 'tv';
  categories?: {
    [key: string]: string[];
  };
  downloadLinks?: string[];
  directDownload?: DirectDownload;
  error?: string;
}

const TELEGRAM_BOT_BASE = 'https://telegram.dog/Phonofilmbot?start=';

export const fetchTylerMoviesDirectLink = async (tmdbId: string): Promise<DirectDownload | null> => {
  try {
    // Validate TMDb ID input
    const cleanTmdbId = tmdbId.trim();
    if (!cleanTmdbId || !/^\d+$/.test(cleanTmdbId)) {
      throw new Error('Invalid TMDb ID format. Must be numeric.');
    }
    
    console.log('🎬 Fetching Tyler Movies Empire direct link for TMDB ID:', cleanTmdbId);
    
    const apiUrl = `https://api.tylermoviesempire.com/api/id/${cleanTmdbId}/1`;
    console.log('📡 API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorMsg = `API request failed with status ${response.status}`;
      console.log('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    const data: TylerMoviesResponse = await response.json();
    console.log('📦 Tyler Movies API response:', data);
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    if (!data.data?.qualities?.["720p"]) {
      throw new Error('No 720p quality available for this movie');
    }
    
    const quality720p = data.data.qualities["720p"];
    const { id, name, size } = quality720p;
    
    if (!id || !name) {
      throw new Error('Invalid quality data: missing id or filename');
    }
    
    // URL encode the filename properly using encodeURIComponent
    // This handles special characters like [], spaces, etc.
    const encodedFilename = encodeURIComponent(name);
    const directUrl = `https://api.tylermoviesempire.com/dl/${id}/${encodedFilename}`;
    
    console.log('✅ Generated direct download URL:', directUrl);
    console.log('📁 Filename:', name);
    console.log('📏 Size:', size);
    
    return {
      url: directUrl,
      filename: name,
      size: size || 'Unknown',
      quality: '720p'
    };
    
  } catch (error) {
    console.error('❌ Tyler Movies Empire API error:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch download link');
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

export const fetchSeriesDownloadLinks = async (tmdbId: string, title: string, imdbId?: string): Promise<DownloadResult> => {
  try {
    console.log('🔍 Fetching TV series download links for TMDB ID:', tmdbId);
    
    // Call our Supabase edge function
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('fetch-series', {
      body: {
        tmdbId,
        title,
        imdbId
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }

    if (!data || !data.success) {
      console.error('❌ Edge function returned error:', data?.message);
      throw new Error(data?.message || 'Failed to fetch series data');
    }

    console.log('✅ Series data fetched successfully:', data.data);

    return {
      tmdbId,
      type: 'tv',
      downloadLinks: data.data?.downloadLinks || [],
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
  
  // For movies, fetch both Telegram links and Tyler Movies direct link
  const [telegramResult, tylerDirectLink] = await Promise.all([
    fetchMovieDownloadLinks(tmdbId),
    fetchTylerMoviesDirectLink(tmdbId)
  ]);
  
  return {
    ...telegramResult,
    directDownload: tylerDirectLink || undefined
  };
};