import { useCallback, useEffect, useRef } from 'react';

const STORAGE_PREFIX = 'scrollRestoration:';

/** Mark an element with a stable id to have it restored by name rather than by pixel offset. */
export const SCROLL_ANCHOR = 'data-scroll-anchor';

/** Mark an element that pins itself over the top of the viewport, so anchors can be placed clear of it. */
export const SCROLL_OBSTRUCTION = 'data-scroll-obstruction';

/**
 * How far down the viewport whatever is pinned at the top currently reaches. Measured rather than
 * assumed: the page header grows when it wraps, so any constant is wrong on some layout.
 */
const obstructedTop = (): number =>
  [...document.querySelectorAll(`[${SCROLL_OBSTRUCTION}]`)]
    .filter((element) => ['fixed', 'sticky'].includes(getComputedStyle(element).position))
    .reduce((lowest, element) => Math.max(lowest, element.getBoundingClientRect().bottom), 0);

type RememberedPosition = {
  anchor?: string;
  offset: number;
};

const readOffset = (): number => document.querySelector('.scrollable-content')?.scrollTop || window.scrollY;

const applyOffset = (offset: number) => {
  document.querySelector('.scrollable-content')?.scrollTo(0, offset);
  window.scrollTo(0, offset);
};

/** How much of a section has to clear the header before it counts as the one being read. */
const VISIBLE_FRACTION = 0.5;

const shownBelow = (rect: DOMRect, clearance: number): number => {
  const height = rect.bottom - rect.top;

  return height <= 0 ? 0 : (rect.bottom - Math.max(rect.top, clearance)) / height;
};

/** The anchor the reader is looking at: the topmost one at least half clear of the header. */
const topmost = (elements: Set<Element>, clearance: number): Element | undefined => {
  const byTop = [...elements]
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .sort((a, b) => a.rect.top - b.rect.top);

  return (byTop.find(({ rect }) => shownBelow(rect, clearance) >= VISIBLE_FRACTION) ?? byTop.at(-1))?.element;
};

/**
 * Only works where the scroll container is the document or a `.scrollable-content` wrapper. Pass
 * `ready` as false until the content is rendered: anchors are found once, when it flips true, and
 * that is also when a stored position is restored.
 */
const useScrollRestoration = (key: string | number | undefined, ready: boolean) => {
  const storageKey = key === undefined ? undefined : `${STORAGE_PREFIX}${key}`;
  const visible = useRef(new Set<Element>());

  useEffect(() => {
    if (!ready) {
      return;
    }

    const intersecting = visible.current;

    const observer = new IntersectionObserver((entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersecting.add(entry.target);
        } else {
          intersecting.delete(entry.target);
        }
      })
    );

    document.querySelectorAll(`[${SCROLL_ANCHOR}]`).forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      intersecting.clear();
    };
  }, [ready]);

  const remember = useCallback(() => {
    if (storageKey === undefined) {
      return;
    }

    const anchor = topmost(visible.current, obstructedTop())?.getAttribute(SCROLL_ANCHOR) ?? undefined;

    sessionStorage.setItem(storageKey, JSON.stringify({ anchor, offset: readOffset() } satisfies RememberedPosition));
  }, [storageKey]);

  const restore = useCallback(() => {
    if (storageKey === undefined) {
      return;
    }

    const stored = sessionStorage.getItem(storageKey);

    if (stored === null) {
      return;
    }

    sessionStorage.removeItem(storageKey);

    let position: RememberedPosition;

    try {
      position = JSON.parse(stored) as RememberedPosition;
    } catch {
      return;
    }

    requestAnimationFrame(() => {
      const anchor = position.anchor ? document.querySelector(`[${SCROLL_ANCHOR}="${position.anchor}"]`) : null;
      const wasAtTop = position.offset === 0;

      if (wasAtTop || anchor === null) {
        applyOffset(position.offset);
        return;
      }

      // scrolled rather than scrollIntoView'd, so the measured header replaces a scrollMarginTop
      applyOffset(readOffset() + anchor.getBoundingClientRect().top - obstructedTop());
    });
  }, [storageKey]);

  useEffect(() => {
    if (ready) {
      restore();
    }
  }, [ready, restore]);

  return { remember };
};

export default useScrollRestoration;
