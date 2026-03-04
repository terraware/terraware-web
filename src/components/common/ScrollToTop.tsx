import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Resets the scroll position whenever the route pathname changes. Scrolls both
 * the nearest `.scrollable-content` container and the document viewport to the
 * top, covering layouts where either could be the actual scroll container.
 *
 * Usage: Place <ScrollToTop /> inside any routed subtree where navigation
 * should reset scroll position.
 */
const ScrollToTop = (): null => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.querySelector('.scrollable-content')?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
