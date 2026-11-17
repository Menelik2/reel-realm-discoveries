/**
 * Browser CORS failures usually surface as TypeError: Failed to fetch
 * (no status code). Network offline and some extensions look the same.
 */
export function isCorsOrNetworkError(error: unknown): boolean {
  if (!error) return false;

  if (error instanceof TypeError) {
    const msg = (error.message || '').toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network request failed') ||
      msg.includes('load failed') ||
      msg.includes('fetch')
    );
  }

  if (error instanceof DOMException) {
    // AbortError is timeout/cancel — not CORS
    if (error.name === 'AbortError') return false;
    const msg = (error.message || '').toLowerCase();
    return msg.includes('cross-origin') || msg.includes('cors');
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('cors') ||
      msg.includes('cross-origin') ||
      msg.includes('failed to fetch') ||
      msg.includes('networkerror')
    );
  }

  return false;
}

export function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('timeout') || error.name === 'AbortError';
}

/** User-facing message for download / API failures. */
export function userFacingFetchError(error: unknown, fallback: string): string {
  if (isTimeoutError(error)) {
    return 'Request timed out. Check your connection and try again.';
  }
  if (isCorsOrNetworkError(error)) {
    return 'Network or browser security blocked this request. Retrying via our server…';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/**
 * fetch() wrapper that never throws raw CORS TypeErrors without context.
 * Always uses cors mode; maps failures to typed Error messages.
 */
export async function safeFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, {
      ...init,
      mode: init?.mode ?? 'cors',
      credentials: init?.credentials ?? 'omit',
    });
  } catch (error) {
    if (isCorsOrNetworkError(error)) {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : String((input as Request).url || input);
      throw new Error(
        `CORS_OR_NETWORK: Could not reach ${url.split('?')[0]} from the browser`,
      );
    }
    throw error;
  }
}
