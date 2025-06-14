
import { Helmet } from 'react-helmet-async';

interface SEOMetadataProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  contentType?: 'movie' | 'tv';
  movieId?: number;
}

export const SEOMetadata = ({ title, description, imageUrl, contentType, movieId }: SEOMetadataProps) => {
  const pageTitle = title ? `${title} - YENI MOVIE` : 'YENI MOVIE - Discover Movies and TV Series';
  const pageDescription = description ? description.substring(0, 160) : 'YENI MOVIE - Your destination for discovering the latest movies and TV series. Find trailers, ratings, and cast information.';
  const pageUrl = movieId && contentType ? `https://yenimovie.lovable.app/${contentType}/${movieId}` : 'https://yenimovie.lovable.app/';
  const ogImage = imageUrl ? `https://image.tmdb.org/t/p/w500${imageUrl}` : 'https://lovable.dev/opengraph-image-p98pqg.png';

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={contentType ? 'video.movie' : 'website'} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="YENI MOVIE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@lovable_dev" />
      <meta name="twitter:creator" content="@lovable_dev" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};
