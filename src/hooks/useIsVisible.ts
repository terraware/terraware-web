import React, { useEffect, useState } from 'react';

/**
 * Determine if the element denoted by the ref parameter is visible. This is done by checking its intersection with
 * the viewport. For performance, only runs the callback when the ref's visibility changes.
 * See: https://dev.to/jmalvarez/check-if-an-element-is-visible-with-react-hooks-27h8
 *
 * @param ref The ref to the element to detect visibility of.
 */
export function useIsVisible(ref: React.MutableRefObject<any>) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    });

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
}
