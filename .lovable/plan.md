

## Plan: Add Complete TMDB Genre List

Currently, the genre lists in `HomeCategoryRows.tsx` and `MovieFilters.tsx` are hardcoded with only 10 genres. TMDB has many more genres for both movies and TV shows.

### Changes

**1. Create a shared genres constant** (`src/constants/genres.ts`)
- Define the full TMDB genre list for movies and TV (they differ slightly)
- Movie genres: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, Thriller, TV Movie, War, Western
- TV genres: Action & Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Kids, Mystery, News, Reality, Sci-Fi & Fantasy, Soap, Talk, War & Politics, Western

**2. Update `src/components/HomeCategoryRows.tsx`**
- Import from shared constants instead of local hardcoded list

**3. Update `src/components/movie-grid/MovieFilters.tsx`**
- Import from shared constants instead of local hardcoded list

**4. Make genre list content-type aware**
- Show movie genres when `contentType === 'movie'`, TV genres when `contentType === 'tv'`, and a combined/deduplicated list when `contentType === 'all'`

