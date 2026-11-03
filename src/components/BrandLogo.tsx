import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  /** Text size for the wordmark (default ~28px tall). */
  height?: number;
  /** Show compact mark only (no full word). */
  compact?: boolean;
}

/**
 * MovieWeb-inspired full wordmark for Yeni Movie.
 * Clean horizontal logo: bold "Yeni" + accent "Movie".
 */
export const BrandLogo = ({ className, height = 28, compact = false }: BrandLogoProps) => {
  if (compact) {
    return (
      <svg
        viewBox="0 0 40 40"
        width={height}
        height={height}
        className={cn('shrink-0', className)}
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="10" className="fill-primary" />
        <text
          x="20"
          y="27"
          textAnchor="middle"
          className="fill-primary-foreground"
          style={{ fontSize: 18, fontWeight: 800, fontFamily: 'system-ui, sans-serif' }}
        >
          Y
        </text>
      </svg>
    );
  }

  // Full wordmark — proportions similar to MovieWeb horizontal logo
  const w = Math.round(height * (220 / 40));

  return (
    <svg
      viewBox="0 0 220 40"
      width={w}
      height={height}
      className={cn('shrink-0', className)}
      role="img"
      aria-label="Yeni Movie"
    >
      <title>Yeni Movie</title>
      {/* "Yeni" — solid foreground */}
      <text
        x="0"
        y="29"
        className="fill-foreground"
        style={{
          fontSize: 28,
          fontWeight: 800,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          letterSpacing: '-0.04em',
        }}
      >
        Yeni
      </text>
      {/* "Movie" — brand primary accent */}
      <text
        x="72"
        y="29"
        className="fill-primary"
        style={{
          fontSize: 28,
          fontWeight: 800,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          letterSpacing: '-0.04em',
        }}
      >
        Movie
      </text>
    </svg>
  );
};
