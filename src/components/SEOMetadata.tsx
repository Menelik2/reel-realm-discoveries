
import { Helmet } from 'react-helmet-async';

interface SEOMetadataProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  contentType?: 'movie' | 'tv';
  movieId?: number;
  releaseDate?: string;
  rating?: number;
  genres?: string[];
  cast?: string[];
  director?: string;
  duration?: number;
}

export const SEOMetadata = ({ 
  title, 
  description, 
  imageUrl, 
  contentType, 
  movieId, 
  releaseDate, 
  rating, 
  genres = [], 
  cast = [], 
  director,
  duration
}: SEOMetadataProps) => {
  const pageTitle = title ? `${title} - Watch ${contentType === 'tv' ? 'TV Series' : 'Movie'} Online | YENI MOVIE` : 'YENI MOVIE - Watch Movies and TV Series Online Free';
  const pageDescription = description 
    ? `${description.substring(0, 140)}... Watch ${title} online on YENI MOVIE.`
    : 'YENI MOVIE - Your destination for discovering and watching the latest movies and TV series online. Find trailers, ratings, cast information, and streaming links.';
  
  const pageUrl = movieId && contentType ? `https://yenimovie.lovable.app/${contentType}/${movieId}` : 'https://yenimovie.lovable.app/';
  const ogImage = imageUrl ? `https://image.tmdb.org/t/p/w780${imageUrl}` : 'https://lovable.dev/opengraph-image-p98pqg.png';
  
  // Generate enhanced keywords for better SEO
  const keywords = [
    'watch movies online free',
    'stream movies online',
    'watch TV series online',
    'free streaming',
    'movie streaming site',
    'TV show streaming',
    'online cinema',
    'free movies and series',
    'HD movies online',
    'latest movies',
    'popular TV series',
    'YENI MOVIE',
    'movie database',
    'film streaming',
    'series online',
    ...(title ? [
      title, 
      `${title} ${contentType === 'tv' ? 'series' : 'movie'}`, 
      `${title} streaming`, 
      `watch ${title} online`,
      `${title} free online`,
      `${title} HD streaming`
    ] : []),
    ...genres.map(genre => [
      `${genre} movies`,
      `${genre} series`,
      `watch ${genre} online`,
      `best ${genre} ${contentType === 'tv' ? 'shows' : 'movies'}`
    ]).flat(),
    ...(cast.length > 0 ? [
      `${cast[0]} movies`,
      `${cast[0]} ${contentType === 'tv' ? 'TV shows' : 'films'}`,
      ...cast.slice(0, 3).map(actor => `${actor} streaming`)
    ] : []),
    ...(director ? [`${director} movies`, `${director} films`, `${director} director`] : []),
    ...(releaseDate ? [`${releaseDate.split('-')[0]} movies`, `${releaseDate.split('-')[0]} releases`] : [])
  ].filter(Boolean).join(', ');

  // JSON-LD structured data for better search engine understanding
  const structuredData = contentType && title ? {
    "@context": "https://schema.org",
    "@type": contentType === 'movie' ? "Movie" : "TVSeries",
    "name": title,
    "description": description,
    "image": ogImage,
    "url": pageUrl,
    ...(rating && { "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating.toFixed(1),
      "ratingCount": "1000",
      "bestRating": "10",
      "worstRating": "1"
    }}),
    ...(releaseDate && { "datePublished": releaseDate }),
    ...(genres.length > 0 && { "genre": genres }),
    ...(cast.length > 0 && { "actor": cast.map(actor => ({
      "@type": "Person",
      "name": actor
    })) }),
    ...(director && { "director": {
      "@type": "Person",
      "name": director
    }}),
    ...(duration && { "duration": `PT${duration}M` }),
    "potentialAction": {
      "@type": "WatchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": pageUrl,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      }
    },
    "provider": {
      "@type": "Organization",
      "name": "YENI MOVIE",
      "url": "https://yenimovie.lovable.app"
    }
  } : null;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={contentType ? 'video.movie' : 'website'} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="780" />
      <meta property="og:image:height" content="439" />
      <meta property="og:image:alt" content={title || 'YENI MOVIE'} />
      <meta property="og:site_name" content="YENI MOVIE" />
      <meta property="og:locale" content="en_US" />
      
      {/* Additional movie-specific Open Graph tags */}
      {contentType === 'movie' && (
        <>
          <meta property="video:actor" content={cast.join(', ')} />
          {director && <meta property="video:director" content={director} />}
          {releaseDate && <meta property="video:release_date" content={releaseDate} />}
          {genres.length > 0 && <meta property="video:tag" content={genres.join(', ')} />}
          {duration && <meta property="video:duration" content={`${duration * 60}`} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@yenimovie" />
      <meta name="twitter:creator" content="@yenimovie" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title || 'YENI MOVIE'} />

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="YENI MOVIE" />
      <meta name="publisher" content="YENI MOVIE" />
      <meta name="application-name" content="YENI MOVIE" />
      <meta name="theme-color" content="#000000" />
      
      {/* Mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Enhanced Website Schema for homepage */}
      {!contentType && (
        <>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "YENI MOVIE",
              "alternateName": ["Watch Movies and TV Series Online", "Free Movie Streaming", "Online Cinema"],
              "url": "https://yenimovie.lovable.app",
              "description": "Watch the latest movies and TV series online for free. Discover new content, read reviews, and find streaming links. Your ultimate destination for entertainment.",
              "keywords": "free movies, streaming, TV series, online cinema, movie database, watch online",
              "inLanguage": "en-US",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://yenimovie.lovable.app/?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "YENI MOVIE",
                "url": "https://yenimovie.lovable.app",
                "description": "Leading platform for watching movies and TV series online",
                "sameAs": [
                  "https://yenimovie.lovable.app"
                ]
              },
              "mainEntity": {
                "@type": "ItemList",
                "name": "Movies and TV Series Collection",
                "description": "Comprehensive collection of movies and TV series available for streaming"
              }
            })}
          </script>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "YENI MOVIE",
              "url": "https://yenimovie.lovable.app",
              "description": "Premier destination for watching movies and TV series online for free",
              "foundingDate": "2024",
              "knowsAbout": [
                "Movies",
                "TV Series",
                "Streaming",
                "Entertainment",
                "Cinema",
                "Television Shows"
              ],
              "serviceType": "Entertainment Streaming Platform",
              "areaServed": "Worldwide"
            })}
          </script>
        </>
      )}

      {/* Breadcrumb Navigation Schema */}
      {contentType && title && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://yenimovie.lovable.app"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": contentType === 'movie' ? 'Movies' : 'TV Series',
                "item": `https://yenimovie.lovable.app/${contentType}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": title,
                "item": pageUrl
              }
            ]
          })}
        </script>
      )}
    </Helmet>
  );
};
