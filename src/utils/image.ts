import type { SyntheticEvent } from 'react';

/** Hides a poster `<img>` that failed to load (e.g. upstream CDN outage) instead of showing a broken-image icon. */
export function hidePosterOnError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.visibility = 'hidden';
}
