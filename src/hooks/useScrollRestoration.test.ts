import { rstest } from '@rstest/core';
import { renderHook } from '@testing-library/react';

import useScrollRestoration, { SCROLL_ANCHOR, SCROLL_OBSTRUCTION } from './useScrollRestoration';

type Remembered = {
  anchor?: string;
  offset: number;
};

const storageKeyFor = (key: string | number) => `scrollRestoration:${key}`;

const remembered = (key: string | number): Remembered | null =>
  JSON.parse(sessionStorage.getItem(storageKeyFor(key)) ?? 'null') as Remembered | null;

/**
 * jsdom has no layout, so nothing ever really scrolls: `window.scrollTo` is unimplemented and
 * `Element.prototype.scrollTo` does not exist at all. These stubs stand in for the scroll calls so
 * the position `restore` computes is observable -- the assertions below are about the offset the
 * hook hands to each target, never about the page actually moving.
 */
let windowScrollTo: ReturnType<typeof rstest.fn>;
let containerScrollTo: ReturnType<typeof rstest.fn>;
let originalWindowScrollTo: typeof window.scrollTo;
let originalRequestAnimationFrame: typeof window.requestAnimationFrame;

const originalIntersectionObserver = globalThis.IntersectionObserver;

/**
 * The stub in `setupTests.js` is inert, so nothing ever intersects. This one hands the hook's
 * callback back to the test, which can then declare what the reader can see.
 */
type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void;

let intersectionCallback: IntersectionCallback | undefined;
let observed: Element[];

class ControllableIntersectionObserver {
  constructor(callback: IntersectionCallback) {
    intersectionCallback = callback;
  }
  observe(element: Element) {
    observed.push(element);
  }
  unobserve(element: Element) {
    observed = observed.filter((candidate) => candidate !== element);
  }
  disconnect() {
    observed = [];
    intersectionCallback = undefined;
  }
  takeRecords() {
    return [];
  }
}

const intersect = (...elements: Element[]) =>
  intersectionCallback?.(
    elements.map((target) => ({ isIntersecting: true, target }) as unknown as IntersectionObserverEntry)
  );

const rect = (top: number, bottom = top): DOMRect => ({
  top,
  bottom,
  left: 0,
  right: 0,
  width: 0,
  height: bottom - top,
  x: 0,
  y: top,
  toJSON: () => ({}),
});

/** jsdom's `getBoundingClientRect` is all zeroes, so each anchor is told where it sits. */
const addAnchor = (name: string, top: number) => {
  const element = document.createElement('div');
  element.setAttribute(SCROLL_ANCHOR, name);
  element.getBoundingClientRect = () => rect(top);
  document.body.appendChild(element);

  return element;
};

/** Stands in for whatever a view pins over the top of the viewport. */
const addObstruction = (bottom: number, position = 'fixed') => {
  const element = document.createElement('div');
  element.setAttribute(SCROLL_OBSTRUCTION, '');
  element.style.position = position;
  element.getBoundingClientRect = () => rect(0, bottom);
  document.body.appendChild(element);

  return element;
};

const addScrollContainer = (scrollTop: number) => {
  const container = document.createElement('div');
  container.className = 'scrollable-content';
  document.body.appendChild(container);
  container.scrollTop = scrollTop;
  Object.assign(container, { scrollTo: containerScrollTo });

  return container;
};

const setWindowScrollY = (scrollY: number) =>
  Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true, writable: true });

beforeEach(() => {
  sessionStorage.clear();
  document.body.innerHTML = '';

  windowScrollTo = rstest.fn();
  containerScrollTo = rstest.fn();
  intersectionCallback = undefined;
  observed = [];

  originalWindowScrollTo = window.scrollTo;
  originalRequestAnimationFrame = window.requestAnimationFrame;
  window.scrollTo = windowScrollTo as unknown as typeof window.scrollTo;
  // run the frame callback inline: the real one fires on a timer, which would make this racy
  window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  }) as typeof window.requestAnimationFrame;

  globalThis.IntersectionObserver = ControllableIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  window.scrollTo = originalWindowScrollTo;
  window.requestAnimationFrame = originalRequestAnimationFrame;
  globalThis.IntersectionObserver = originalIntersectionObserver;

  setWindowScrollY(0);
  sessionStorage.clear();
  document.body.innerHTML = '';
});

describe('useScrollRestoration', () => {
  describe('remember', () => {
    test('should store the anchor the reader is looking at alongside the pixel offset', () => {
      addScrollContainer(240);
      addObstruction(180);
      // intersecting, but the pinned header covers it, so the reader cannot see it
      const behindTheHeader = addAnchor('metric-2', 80);
      // the first one the header leaves visible, right on the boundary
      const clearOfTheHeader = addAnchor('metric-3', 180);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(behindTheHeader, clearOfTheHeader);
      result.current.remember();

      expect(remembered(7)).toEqual({ anchor: 'metric-3', offset: 240 });
    });

    test('should observe every anchor in the document once the content is ready', () => {
      const first = addAnchor('metric-1', 0);
      const second = addAnchor('metric-2', 400);

      renderHook(() => useScrollRestoration(7, true));

      expect(observed).toEqual([first, second]);
    });

    test('should pick the first anchor clear of the header over one scrolled above the top edge', () => {
      addScrollContainer(240);
      addObstruction(180);
      const straddlingTheTopEdge = addAnchor('metric-1', -120);
      const clearOfTheHeader = addAnchor('metric-2', 240);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(straddlingTheTopEdge, clearOfTheHeader);
      result.current.remember();

      expect(remembered(7)?.anchor).toBe('metric-2');
    });

    test('should pick the lowest anchor when every one of them is behind the header', () => {
      addScrollContainer(240);
      addObstruction(180);
      const aboveTheTopEdge = addAnchor('metric-1', -300);
      const behindTheHeader = addAnchor('metric-2', 160);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(aboveTheTopEdge, behindTheHeader);
      result.current.remember();

      expect(remembered(7)?.anchor).toBe('metric-2');
    });

    test('should resolve one anchor layout two ways as the header grows, which is why it is measured', () => {
      addScrollContainer(240);
      const header = addObstruction(80);
      const first = addAnchor('metric-1', 100);
      const second = addAnchor('metric-2', 300);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(first, second);
      result.current.remember();

      expect(remembered(7)?.anchor).toBe('metric-1');

      // on a narrow layout the header wraps onto further rows and swallows the first anchor
      header.getBoundingClientRect = () => rect(0, 220);
      result.current.remember();

      expect(remembered(7)?.anchor).toBe('metric-2');
    });

    test('should measure down to the lowest edge when more than one element is pinned', () => {
      addScrollContainer(240);
      addObstruction(64);
      addObstruction(200);
      const behindTheHeader = addAnchor('metric-1', 150);
      const clearOfTheHeader = addAnchor('metric-2', 260);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(behindTheHeader, clearOfTheHeader);
      result.current.remember();

      expect(remembered(7)?.anchor).toBe('metric-2');
    });

    test('should treat the top of the viewport as clear when nothing is pinned over it', () => {
      addScrollContainer(240);
      const aboveTheTopEdge = addAnchor('metric-1', -40);
      const atTheTopEdge = addAnchor('metric-2', 0);
      addAnchor('metric-3', 120);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(aboveTheTopEdge, atTheTopEdge);
      result.current.remember();

      expect(remembered(7)?.anchor).toBe('metric-2');
    });

    test('should ignore a marked element that scrolls with the page rather than pinning itself', () => {
      addScrollContainer(240);
      addObstruction(400, 'relative');
      const atTheTopEdge = addAnchor('metric-1', 0);
      const belowIt = addAnchor('metric-2', 500);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(atTheTopEdge, belowIt);
      result.current.remember();

      expect(remembered(7)?.anchor).toBe('metric-1');
    });

    test('should count a sticky element as pinned', () => {
      addScrollContainer(240);
      addObstruction(180, 'sticky');
      const behindTheHeader = addAnchor('metric-1', 20);
      const clearOfTheHeader = addAnchor('metric-2', 300);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(behindTheHeader, clearOfTheHeader);
      result.current.remember();

      expect(remembered(7)?.anchor).toBe('metric-2');
    });

    test('should drop an anchor that has scrolled out of view', () => {
      addScrollContainer(240);
      const anchor = addAnchor('metric-1', 40);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(anchor);
      intersectionCallback?.([{ isIntersecting: false, target: anchor } as unknown as IntersectionObserverEntry]);
      result.current.remember();

      expect(remembered(7)).toEqual({ offset: 240 });
    });

    test('should store the offset of the scrollable wrapper when no anchor is in view', () => {
      addScrollContainer(240);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      result.current.remember();

      expect(remembered(7)).toEqual({ offset: 240 });
    });

    test('should store the window offset when there is no scrollable wrapper', () => {
      setWindowScrollY(333);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      result.current.remember();

      expect(remembered(7)).toEqual({ offset: 333 });
    });
  });

  describe('restore', () => {
    test('should scroll the remembered anchor to just below the pinned header, leaving the offset unused', () => {
      sessionStorage.setItem(storageKeyFor(7), JSON.stringify({ anchor: 'metric-2', offset: 240 }));
      addScrollContainer(500);
      addObstruction(70);
      addAnchor('metric-2', 120);

      renderHook(() => useScrollRestoration(7, true));

      // where it sits now (500 + 120) less the band the header covers
      expect(containerScrollTo).toHaveBeenCalledTimes(1);
      expect(containerScrollTo).toHaveBeenCalledWith(0, 550);
      expect(windowScrollTo).toHaveBeenCalledTimes(1);
      expect(windowScrollTo).toHaveBeenCalledWith(0, 550);
    });

    test('should scroll an anchor already above the top edge back down to the header', () => {
      sessionStorage.setItem(storageKeyFor(7), JSON.stringify({ anchor: 'metric-2', offset: 240 }));
      setWindowScrollY(800);
      addObstruction(70);
      addAnchor('metric-2', -130);

      renderHook(() => useScrollRestoration(7, true));

      expect(windowScrollTo).toHaveBeenCalledWith(0, 600);
    });

    test('should fall back to the pixel offset when the remembered anchor is gone from the page', () => {
      sessionStorage.setItem(storageKeyFor(7), JSON.stringify({ anchor: 'metric-2', offset: 240 }));
      addScrollContainer(500);
      addObstruction(70);
      addAnchor('some-other-metric', 120);

      renderHook(() => useScrollRestoration(7, true));

      expect(containerScrollTo).toHaveBeenCalledWith(0, 240);
      expect(windowScrollTo).toHaveBeenCalledWith(0, 240);
    });

    test('should hand a position with no anchor to the scroll targets and consume the stored entry', () => {
      sessionStorage.setItem(storageKeyFor(7), JSON.stringify({ offset: 240 }));
      addScrollContainer(0);

      renderHook(() => useScrollRestoration(7, true));

      expect(containerScrollTo).toHaveBeenCalledWith(0, 240);
      expect(windowScrollTo).toHaveBeenCalledWith(0, 240);
      expect(sessionStorage.getItem(storageKeyFor(7))).toBeNull();
    });

    test('should wait for the content to be ready before restoring', () => {
      sessionStorage.setItem(storageKeyFor(7), JSON.stringify({ anchor: 'metric-2', offset: 240 }));
      addScrollContainer(500);
      addObstruction(70);

      const { rerender } = renderHook(({ ready }: { ready: boolean }) => useScrollRestoration(7, ready), {
        initialProps: { ready: false },
      });

      expect(containerScrollTo).not.toHaveBeenCalled();
      expect(windowScrollTo).not.toHaveBeenCalled();

      addAnchor('metric-2', 120);
      rerender({ ready: true });

      expect(containerScrollTo).toHaveBeenCalledWith(0, 550);
      expect(windowScrollTo).toHaveBeenCalledWith(0, 550);
    });

    test('should not restore a second time, since the first mount consumed the stored position', () => {
      sessionStorage.setItem(storageKeyFor(7), JSON.stringify({ anchor: 'metric-2', offset: 240 }));
      addScrollContainer(500);
      addObstruction(70);
      addAnchor('metric-2', 120);

      renderHook(() => useScrollRestoration(7, true));

      expect(containerScrollTo).toHaveBeenCalledTimes(1);
      expect(windowScrollTo).toHaveBeenCalledTimes(1);
      containerScrollTo.mockClear();
      windowScrollTo.mockClear();

      renderHook(() => useScrollRestoration(7, true));

      expect(containerScrollTo).not.toHaveBeenCalled();
      expect(windowScrollTo).not.toHaveBeenCalled();
    });

    test('should do nothing when arriving with nothing stored for the key', () => {
      addScrollContainer(500);
      addObstruction(70);
      addAnchor('metric-2', 120);

      renderHook(() => useScrollRestoration(7, true));

      expect(containerScrollTo).not.toHaveBeenCalled();
      expect(windowScrollTo).not.toHaveBeenCalled();
    });

    test('should not pick up a position remembered under a different key', () => {
      addScrollContainer(240);
      const anchor = addAnchor('metric-2', 40);

      const { result: reportOne } = renderHook(() => useScrollRestoration(1, true));
      intersect(anchor);
      reportOne.current.remember();

      renderHook(() => useScrollRestoration(2, true));

      expect(containerScrollTo).not.toHaveBeenCalled();
      expect(windowScrollTo).not.toHaveBeenCalled();
      expect(remembered(1)).toEqual({ anchor: 'metric-2', offset: 240 });
    });
  });

  test('should neither remember nor restore when the key is undefined', () => {
    addScrollContainer(240);
    const anchor = addAnchor('metric-2', 40);
    // the key an unguarded hook would have written to and read from
    const untouched = JSON.stringify({ anchor: 'other-report', offset: 1 });
    sessionStorage.setItem(storageKeyFor('undefined'), untouched);

    const { result } = renderHook(() => useScrollRestoration(undefined, true));
    intersect(anchor);
    result.current.remember();

    expect(sessionStorage.getItem(storageKeyFor('undefined'))).toBe(untouched);
    expect(sessionStorage.length).toBe(1);
    expect(containerScrollTo).not.toHaveBeenCalled();
    expect(windowScrollTo).not.toHaveBeenCalled();
  });
});
