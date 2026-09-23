import { useCallback, useEffect, useRef } from 'react';

const STORAGE_PREFIX = 'scrollRestoration:';

/** Mark an element with a stable id to have it restored by name rather than by pixel offset. */
export const SCROLL_ANCHOR = 'data-scroll-anchor';

type RememberedPosition = {
  anchor?: string;
  offset: number;
};

const readOffset = (): number => document.querySelector('.scrollable-content')?.scrollTop || window.scrollY;

const applyOffset = (offset: number) => {
  document.querySelector('.scrollable-content')?.scrollTo(0, offset);
  window.scrollTo(0, offset);
};

/** The anchor the reader is looking at: the first one below the top edge, else the one straddling it. */
const topmost = (elements: Set<Element>): Element | undefined => {
  const byTop = [...elements]
    .map((element) => ({ element, top: element.getBoundingClientRect().top }))
    .sort((a, b) => a.top - b.top);

  return (byTop.find(({ top }) => top >= 0) ?? byTop.at(-1))?.element;
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

    const anchor = topmost(visible.current)?.getAttribute(SCROLL_ANCHOR) ?? undefined;

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

      if (anchor) {
        anchor.scrollIntoView({ block: 'center' });
      } else {
        applyOffset(position.offset);
      }
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
