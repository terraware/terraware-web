import { rstest } from '@rstest/core';
import { renderHook } from '@testing-library/react';

import useScrollRestoration, { SCROLL_ANCHOR } from './useScrollRestoration';

type Remembered = {
  anchor?: string;
  offset: number;
};

const storageKeyFor = (key: string | number) => `scrollRestoration:${key}`;

const remembered = (key: string | number): Remembered | null =>
  JSON.parse(sessionStorage.getItem(storageKeyFor(key)) ?? 'null') as Remembered | null;

/**
 * jsdom has no layout, so nothing ever really scrolls: `window.scrollTo` is unimplemented and
 * neither `Element.prototype.scrollTo` nor `Element.prototype.scrollIntoView` exists at all. These
 * stubs stand in for the scroll calls so the choice `restore` makes is observable -- the assertions
 * below are about which target the hook hands the position to, never about the page actually moving.
 */
let windowScrollTo: ReturnType<typeof rstest.fn>;
let containerScrollTo: ReturnType<typeof rstest.fn>;
let scrollIntoView: ReturnType<typeof rstest.fn>;
let originalWindowScrollTo: typeof window.scrollTo;
let originalRequestAnimationFrame: typeof window.requestAnimationFrame;

const originalScrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
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

const rectAt = (top: number): DOMRect => ({
  top,
  bottom: top,
  left: 0,
  right: 0,
  width: 0,
  height: 0,
  x: 0,
  y: top,
  toJSON: () => ({}),
});

/** jsdom's `getBoundingClientRect` is all zeroes, so each anchor is told where it sits. */
const addAnchor = (name: string, top: number) => {
  const element = document.createElement('div');
  element.setAttribute(SCROLL_ANCHOR, name);
  element.getBoundingClientRect = () => rectAt(top);
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
  scrollIntoView = rstest.fn();
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

  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    value: scrollIntoView,
    configurable: true,
    writable: true,
  });
  globalThis.IntersectionObserver = ControllableIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  window.scrollTo = originalWindowScrollTo;
  window.requestAnimationFrame = originalRequestAnimationFrame;
  globalThis.IntersectionObserver = originalIntersectionObserver;

  if (originalScrollIntoView) {
    Object.defineProperty(Element.prototype, 'scrollIntoView', originalScrollIntoView);
  } else {
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  }

  setWindowScrollY(0);
  sessionStorage.clear();
  document.body.innerHTML = '';
});

describe('useScrollRestoration', () => {
  describe('remember', () => {
    test('should store the anchor the reader is looking at alongside the pixel offset', () => {
      addScrollContainer(240);
      const onScreen = addAnchor('metric-2', 40);
      const furtherDown = addAnchor('metric-3', 900);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(onScreen, furtherDown);
      result.current.remember();

      expect(remembered(7)).toEqual({ anchor: 'metric-2', offset: 240 });
    });

    test('should observe every anchor in the document once the content is ready', () => {
      const first = addAnchor('metric-1', 0);
      const second = addAnchor('metric-2', 400);

      renderHook(() => useScrollRestoration(7, true));

      expect(observed).toEqual([first, second]);
    });

    test('should pick the first anchor below the top edge over one scrolled above it', () => {
      addScrollContainer(240);
      const straddlingTheTopEdge = addAnchor('metric-1', -120);
      const justBelowTheTopEdge = addAnchor('metric-2', 80);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(straddlingTheTopEdge, justBelowTheTopEdge);
      result.current.remember();

      expect(remembered(7)?.anchor).toBe('metric-2');
    });

    test('should pick the least negative anchor when every one of them is above the top edge', () => {
      addScrollContainer(240);
      const wellAbove = addAnchor('metric-1', -300);
      const justAbove = addAnchor('metric-2', -40);

      const { result } = renderHook(() => useScrollRestoration(7, true));
      intersect(wellAbove, justAbove);
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
    test('should centre the remembered anchor and leave the pixel offset unused', () => {
      sessionStorage.setItem(storageKeyFor(7), JSON.stringify({ anchor: 'metric-2', offset: 240 }));
      addScrollContainer(0);
      const anchor = addAnchor('metric-2', 900);

      renderHook(() => useScrollRestoration(7, true));

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
      expect(scrollIntoView.mock.contexts[0]).toBe(anchor);
      expect(containerScrollTo).not.toHaveBeenCalled();
      expect(windowScrollTo).not.toHaveBeenCalled();
    });

    test('should fall back to the pixel offset when the remembered anchor is gone from the page', () => {
      sessionStorage.setItem(storageKeyFor(7), JSON.stringify({ anchor: 'metric-2', offset: 240 }));
      addScrollContainer(0);
      addAnchor('some-other-metric', 900);

      renderHook(() => useScrollRestoration(7, true));

      expect(scrollIntoView).not.toHaveBeenCalled();
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
      addScrollContainer(0);

      const { rerender } = renderHook(({ ready }: { ready: boolean }) => useScrollRestoration(7, ready), {
        initialProps: { ready: false },
      });

      expect(scrollIntoView).not.toHaveBeenCalled();
      expect(windowScrollTo).not.toHaveBeenCalled();

      addAnchor('metric-2', 900);
      rerender({ ready: true });

      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
    });

    test('should not restore a second time, since the first mount consumed the stored position', () => {
      sessionStorage.setItem(storageKeyFor(7), JSON.stringify({ anchor: 'metric-2', offset: 240 }));
      addScrollContainer(0);
      addAnchor('metric-2', 900);

      renderHook(() => useScrollRestoration(7, true));

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      scrollIntoView.mockClear();

      renderHook(() => useScrollRestoration(7, true));

      expect(scrollIntoView).not.toHaveBeenCalled();
      expect(containerScrollTo).not.toHaveBeenCalled();
      expect(windowScrollTo).not.toHaveBeenCalled();
    });

    test('should do nothing when arriving with nothing stored for the key', () => {
      addScrollContainer(0);
      addAnchor('metric-2', 900);

      renderHook(() => useScrollRestoration(7, true));

      expect(scrollIntoView).not.toHaveBeenCalled();
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

      expect(scrollIntoView).not.toHaveBeenCalled();
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
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(containerScrollTo).not.toHaveBeenCalled();
    expect(windowScrollTo).not.toHaveBeenCalled();
  });
});
