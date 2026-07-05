/**
 * useSpatialNavigation
 * Provides D-pad/arrow key based 2D spatial navigation for TV mode.
 * Finds all [data-focusable] elements and navigates between them
 * based on directional arrow key presses.
 */

import { useEffect, useCallback } from 'react';

function getRect(el: Element): DOMRect {
  return el.getBoundingClientRect();
}

function getCenter(rect: DOMRect): { x: number; y: number } {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Check if an element is navigable (not a small icon, not hidden, not in a no-spatial zone)
 */
function isNavigable(el: Element): boolean {
  const rect = getRect(el);
  const MIN_NAVIGABLE_SIZE = 30;
  const MIN_NAVIGABLE_AREA = 900;

  // Skip elements that are too small (icons, buttons in header/nav)
  if (rect.width < MIN_NAVIGABLE_SIZE || rect.height < MIN_NAVIGABLE_SIZE) return false;
  if (rect.width * rect.height < MIN_NAVIGABLE_AREA) return false;

  // Skip elements with [data-no-spatial] attribute themselves
  if (el.hasAttribute('data-no-spatial')) return false;

  // Skip elements inside [data-no-spatial] containers (check all ancestors)
  if (el.closest('[data-no-spatial]')) return false;

  // Skip elements inside <header>, <nav>, <aside> tags (chrome/UI navigation)
  if (el.closest('header, nav, aside')) return false;

  // Skip hidden elements
  if (el.hasAttribute('hidden') || getComputedStyle(el).visibility === 'hidden') return false;

  // Skip disabled elements
  if (el.hasAttribute('disabled')) return false;

  return true;
}

function findBestCandidate(
  current: Element,
  candidates: Element[],
  direction: Direction
): Element | null {
  const currentRect = getRect(current);
  const currentCenter = getCenter(currentRect);

  let bestElement: Element | null = null;
  let bestScore = Infinity;

  for (const candidate of candidates) {
    if (candidate === current) continue;

    const candidateRect = getRect(candidate);
    const candidateCenter = getCenter(candidateRect);

    const dx = candidateCenter.x - currentCenter.x;
    const dy = candidateCenter.y - currentCenter.y;

    let isInDirection = false;
    switch (direction) {
      case 'up': isInDirection = dy < -10; break;
      case 'down': isInDirection = dy > 10; break;
      case 'left': isInDirection = dx < -10; break;
      case 'right': isInDirection = dx > 10; break;
    }

    if (!isInDirection) continue;

    let score: number;
    if (direction === 'up' || direction === 'down') {
      score = Math.abs(dy) + Math.abs(dx) * 3;
    } else {
      score = Math.abs(dx) + Math.abs(dy) * 3;
    }

    if (score < bestScore) {
      bestScore = score;
      bestElement = candidate;
    }
  }

  return bestElement;
}

export function useSpatialNavigation(enabled: boolean) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const directionMap: Record<string, Direction> = {
      ArrowUp: 'up', ArrowDown: 'down',
      ArrowLeft: 'left', ArrowRight: 'right',
    };

    const direction = directionMap[e.key];
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (isInput) {
      if (!direction || direction === 'left' || direction === 'right') return;
      if (e.defaultPrevented) return;
    }

    if (direction) {
      const focused = document.activeElement as HTMLElement | null;
      if (focused?.closest('[data-no-spatial]')) return;

      const focusableElements = Array.from(
        document.querySelectorAll('[data-focusable]:not([disabled]):not([aria-hidden="true"])')
      ).filter(isNavigable);

      if (focusableElements.length === 0) return;

      const currentFocused = document.activeElement;
      const isAlreadyFocused = currentFocused && focusableElements.includes(currentFocused);

      if (!isAlreadyFocused) {
        (focusableElements[0] as HTMLElement).focus();
        e.preventDefault();
        return;
      }

      const best = findBestCandidate(currentFocused!, focusableElements, direction);
      if (best) {
        (best as HTMLElement).focus();
        e.preventDefault();
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}
