# Watch Now player setup

The catalogue uses TMDB for titles, artwork, cast, seasons, and episode metadata. TMDB does not provide full-length movie or television streams.

## Configure an authorised embed provider

Set this build-time variable in your deployment environment:

```env
VITE_VIDEO_EMBED_BASE_URL=https://your-authorised-provider.example
```

The provider must document and support the URL conventions used by this app:

- Movies: `/embed/movie/{tmdb-or-imdb-id}`
- TV episodes: `/embed/tv/{tmdb-or-imdb-id}/{season}/{episode}`

The application deliberately does not fall back to public VidSrc mirror domains. A provider iframe's `load` event only confirms that its document loaded; it cannot prove that media playback started because the iframe is cross-origin. The UI therefore reports provider loading separately from actual playback and does not rotate mirrors based on iframe load events.

## Direct video playback

The native HTML video player accepts a direct, authorised HTTP(S) MP4 URL. HLS playback works where the browser has native HLS support (notably Safari). Other browsers need an HLS.js-based integration before they can play HLS streams.

For a real production streaming service, use a licensed provider or your own storage/CDN and supply signed, time-limited playback URLs. Do not put private signing keys or provider API secrets in Vite variables: all `VITE_*` values are exposed to the browser.

## TV episode selection

Season and episode controls are driven by the season metadata supplied to the modal. Changing either selection creates a new provider URL and resets provider loading/error state. The app cannot verify episode availability inside a third-party cross-origin player.
