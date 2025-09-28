/**
 * Image optimization utilities for TMDB images
 */

export interface ImageSizeConfig {
  mobile: string;
  tablet: string;
  desktop: string;
}

export const TMDB_IMAGE_SIZES = {
  poster: {
    mobile: 'w185',
    tablet: 'w342', 
    desktop: 'w500'
  },
  backdrop: {
    mobile: 'w300',
    tablet: 'w780',
    desktop: 'w1280'
  },
  profile: {
    mobile: 'w45',
    tablet: 'w185',
    desktop: 'w632'
  },
  logo: {
    mobile: 'w45',
    tablet: 'w92',
    desktop: 'w185'
  }
} as const;

/**
 * Generate srcSet for responsive TMDB images
 */
export const generateTMDBSrcSet = (
  tmdbPath: string,
  imageType: keyof typeof TMDB_IMAGE_SIZES
): string => {
  const sizes = TMDB_IMAGE_SIZES[imageType];
  const baseUrl = 'https://image.tmdb.org/t/p/';
  
  return [
    `${baseUrl}${sizes.mobile}${tmdbPath} ${sizes.mobile.slice(1)}w`,
    `${baseUrl}${sizes.tablet}${tmdbPath} ${sizes.tablet.slice(1)}w`,
    `${baseUrl}${sizes.desktop}${tmdbPath} ${sizes.desktop.slice(1)}w`
  ].join(', ');
};

/**
 * Generate sizes attribute for responsive images
 */
export const generateImageSizes = (imageType: keyof typeof TMDB_IMAGE_SIZES): string => {
  const sizeMap = {
    poster: '(max-width: 640px) 185px, (max-width: 768px) 342px, 500px',
    backdrop: '(max-width: 768px) 300px, (max-width: 1024px) 780px, 1280px',
    profile: '(max-width: 640px) 45px, (max-width: 768px) 185px, 632px',
    logo: '(max-width: 640px) 45px, (max-width: 768px) 92px, 185px'
  };
  
  return sizeMap[imageType];
};

/**
 * Get optimal image URL for a given screen size
 */
export const getOptimalImageUrl = (
  tmdbPath: string,
  imageType: keyof typeof TMDB_IMAGE_SIZES,
  screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): string => {
  const size = TMDB_IMAGE_SIZES[imageType][screenSize];
  return `https://image.tmdb.org/t/p/${size}${tmdbPath}`;
};

/**
 * Preload critical images for better performance
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Create a blur placeholder data URL
 */
export const createBlurPlaceholder = (width: number = 10, height: number = 15): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};