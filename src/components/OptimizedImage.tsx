import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  aspectRatio?: string;
  tmdbPath?: string;
  imageType?: 'poster' | 'backdrop' | 'profile' | 'logo';
  fallback?: string;
}

const getTMDBImageSizes = (imageType: string, tmdbPath: string) => {
  const baseUrl = 'https://image.tmdb.org/t/p/';
  
  switch (imageType) {
    case 'poster':
      return {
        srcSet: [
          `${baseUrl}w185${tmdbPath} 185w`,
          `${baseUrl}w342${tmdbPath} 342w`,
          `${baseUrl}w500${tmdbPath} 500w`,
          `${baseUrl}w780${tmdbPath} 780w`
        ].join(', '),
        src: `${baseUrl}w500${tmdbPath}`,
        sizes: '(max-width: 640px) 185px, (max-width: 768px) 342px, (max-width: 1024px) 500px, 780px'
      };
    case 'backdrop':
      return {
        srcSet: [
          `${baseUrl}w300${tmdbPath} 300w`,
          `${baseUrl}w780${tmdbPath} 780w`,
          `${baseUrl}w1280${tmdbPath} 1280w`
        ].join(', '),
        src: `${baseUrl}w1280${tmdbPath}`,
        sizes: '(max-width: 768px) 300px, (max-width: 1024px) 780px, 1280px'
      };
    case 'profile':
      return {
        srcSet: [
          `${baseUrl}w45${tmdbPath} 45w`,
          `${baseUrl}w185${tmdbPath} 185w`,
          `${baseUrl}h632${tmdbPath} 632w`
        ].join(', '),
        src: `${baseUrl}w185${tmdbPath}`,
        sizes: '(max-width: 640px) 45px, (max-width: 768px) 185px, 632px'
      };
    case 'logo':
      return {
        srcSet: [
          `${baseUrl}w45${tmdbPath} 45w`,
          `${baseUrl}w92${tmdbPath} 92w`,
          `${baseUrl}w185${tmdbPath} 185w`
        ].join(', '),
        src: `${baseUrl}w92${tmdbPath}`,
        sizes: '(max-width: 640px) 45px, (max-width: 768px) 92px, 185px'
      };
    default:
      return {
        src: `${baseUrl}w500${tmdbPath}`,
        sizes: '500px'
      };
  }
};

export const OptimizedImage = ({
  src,
  alt,
  className,
  sizes,
  priority = false,
  placeholder = 'empty',
  aspectRatio,
  tmdbPath,
  imageType = 'poster',
  fallback = '/placeholder.svg'
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Get optimized image attributes for TMDB images
  const imageProps = tmdbPath ? getTMDBImageSizes(imageType, tmdbPath) : { src, sizes };

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ aspectRatio }}>
      {/* Loading placeholder */}
      {isLoading && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={hasError ? fallback : (isInView ? imageProps.src : '')}
        srcSet={isInView && !hasError ? imageProps.srcSet : undefined}
        sizes={sizes || imageProps.sizes}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Loading indicator */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};