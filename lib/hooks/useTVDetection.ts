import { useState, useEffect } from 'react';

const TV_USER_AGENT_PATTERNS = [
  /smarttv/i,
  /tizen/i,
  /webos/i,
  /firetv/i,
  /android tv/i,
  /googletv/i,
  /crkey/i,
  /aftt/i,
  /aftm/i,
  /bravia/i,
  /netcast/i,
  /viera/i,
  /hbbtv/i,
];

export function useTVDetection(): boolean {
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    // Method 1: Check URL parameter ?tv=1 (most reliable)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tv') === '1') {
      setIsTV(true);
      return;
    }

    // Method 2: Check User-Agent for known TV devices
    const ua = navigator.userAgent;
    const uaMatch = TV_USER_AGENT_PATTERNS.some(pattern => pattern.test(ua));
    if (uaMatch) {
      setIsTV(true);
      return;
    }

    // Method 3: Check for TV-specific screen characteristics
    // Only flag as TV if screen is very large AND has touch capability (like Android TV)
    // Do NOT flag desktop/laptop screens as TV to preserve keyboard functionality
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isLargeScreen = window.innerWidth >= 1280;

    // TV devices typically have touch (Android TV, Fire TV) or specific UA patterns
    // Desktop monitors have large screens but no touch - do NOT flag as TV
    if (isLargeScreen && hasTouch && window.innerWidth >= 1920 && window.innerHeight >= 1080) {
      setIsTV(true);
    }
  }, []);

  return isTV;
}
