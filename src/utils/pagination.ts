/** Shared pagination helpers for TMDB-backed lists */

/** TMDB hard-caps page requests around 500 */
export const TMDB_MAX_PAGE = 500;

/** Cap exposed in UI / react-query so users aren't lost in deep pages */
export const UI_MAX_PAGE = 100;

export function clampPage(page: unknown, totalPages: number = TMDB_MAX_PAGE): number {
  const n = typeof page === 'number' ? page : Number(page);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(1, Math.floor(n)), Math.max(1, totalPages));
}

export function normalizeTotalPages(totalPages: unknown, max: number = UI_MAX_PAGE): number {
  const n = typeof totalPages === 'number' ? totalPages : Number(totalPages);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), max);
}

/**
 * Build a compact window of page numbers around the current page.
 * Example (page 7 of 20, window 5): [5, 6, 7, 8, 9]
 */
export function pageWindow(
  currentPage: number,
  totalPages: number,
  size = 5
): number[] {
  const total = normalizeTotalPages(totalPages, TMDB_MAX_PAGE);
  const current = clampPage(currentPage, total);
  const windowSize = Math.min(Math.max(1, size), total);

  let start = Math.max(1, current - Math.floor(windowSize / 2));
  let end = start + windowSize - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - windowSize + 1);
  }

  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

export function canGoPrev(currentPage: number): boolean {
  return clampPage(currentPage) > 1;
}

export function canGoNext(currentPage: number, totalPages: number): boolean {
  const total = normalizeTotalPages(totalPages, TMDB_MAX_PAGE);
  return clampPage(currentPage, total) < total;
}
