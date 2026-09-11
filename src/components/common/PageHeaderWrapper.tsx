import React, { type JSX, useLayoutEffect, useRef, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';

import useDeviceInfo from 'src/utils/useDeviceInfo';

import useDebounce from '../../utils/useDebounce';

const TOP_BAR_HEIGHT = 64;
const DEBOUNCE_TIME = 500;
const LEFT_NAV_WIDTH = 220;
// Matches the top padding of the main element, so a pinned header sits where it would in flow.
const HEADER_TOP_GAP = 32;

/**
 * alwaysVisible Keep the header pinned below the top bar instead of hiding it while scrolling down
 * children The child component which is the page header
 * nextElement The HTMLElement immediately following the header element
 */
interface Props {
  alwaysVisible?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  hasNav?: boolean;
  nextElement?: HTMLElement | null;
  nextElementInitialMargin?: number;
}

export default function PageHeaderWrapper({
  alwaysVisible = false,
  children,
  hasNav = true,
  nextElement,
  nextElementInitialMargin = 0,
}: Props): JSX.Element {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollDown, setScrollDown] = useState(false);
  const [height, setHeight] = useState<number>(0);
  const [anim, setAnim] = useState<string | undefined>(undefined);
  const debouncedSticky = useDebounce(sticky, DEBOUNCE_TIME);
  const debouncedScrollDown = useDebounce(scrollDown, DEBOUNCE_TIME);
  const lastDebouncedSticky = useRef(false);
  const { isMobile, isTablet } = useDeviceInfo();

  useLayoutEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  }, [children, ref]);

  useLayoutEffect(() => {
    if (!children) {
      return;
    }

    let lastScrollY = 0;
    const handleScroll = () => {
      const delta = window.scrollY - lastScrollY;
      setScrollDown(delta > 0);
      setScrolled(window.scrollY > 0);

      /*
       * If sticky was already set, and we are scrolling towards the top, don't unset it
       * until we've reached the top of the page as long as we continue to scroll upward.
       */
      setSticky(window.scrollY > height || (sticky && delta < 0 && window.scrollY > 0));

      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [children, nextElement, height, sticky]);

  useLayoutEffect(() => {
    if (nextElement) {
      nextElement.style.marginTop = `${nextElementInitialMargin + (alwaysVisible || debouncedSticky ? height : 0)}px`;
    }
  }, [alwaysVisible, nextElement, height, debouncedSticky, nextElementInitialMargin]);

  useLayoutEffect(() => {
    if (alwaysVisible) {
      setAnim(undefined);
      return;
    }

    const headerMotionIn = keyframes`
      from {
        top: ${TOP_BAR_HEIGHT - height}px;
      }
      to {
        top: ${TOP_BAR_HEIGHT}px;
      }
    `;

    const headerMotionOut = keyframes`
      from {
        top: ${TOP_BAR_HEIGHT}px;
        visibility: visible;
      }
      to {
        top: ${TOP_BAR_HEIGHT - height}px;
        visibility: hidden;
      }
    `;

    // ensure we don't animate out when just transitioning into the sticky region
    const transitionToSticky = !lastDebouncedSticky.current && debouncedSticky;
    if (!debouncedScrollDown) {
      setAnim(`${headerMotionIn} 0.5s 1 ease`);
    } else if (debouncedScrollDown && !transitionToSticky) {
      setAnim(`${headerMotionOut} 0.5s 1 ease`);
    } else {
      setAnim(undefined);
    }
    lastDebouncedSticky.current = debouncedSticky;
  }, [alwaysVisible, debouncedSticky, debouncedScrollDown, height]);

  const pinned = alwaysVisible || debouncedSticky;
  // An always visible header is fixed from the top of the page, so it only takes on the sticky
  // chrome (background, divider, gap filling padding) once content scrolls underneath it.
  const stickyChrome = alwaysVisible ? scrolled : debouncedSticky;

  const stickyTop = debouncedScrollDown ? `${TOP_BAR_HEIGHT - height}px` : `${TOP_BAR_HEIGHT}px`;
  const alwaysVisibleTop = scrolled ? `${TOP_BAR_HEIGHT}px` : `${TOP_BAR_HEIGHT + HEADER_TOP_GAP}px`;

  const styles: Record<string, any> = {
    background: stickyChrome ? theme.palette.TwClrBaseGray025 : undefined,
    borderBottom: stickyChrome ? '1px solid' : '1px transparent',
    borderImage: stickyChrome
      ? `linear-gradient(to right, ${theme.palette.TwClrBaseGray300}00,` +
        `${theme.palette.TwClrBaseGray300}FF, ${theme.palette.TwClrBaseGray300}FF,` +
        `${theme.palette.TwClrBaseGray300}FF, ${theme.palette.TwClrBaseGray300}00) 1`
      : undefined,
    boxShadow: 'none',
    paddingRight: pinned ? theme.spacing(4) : undefined,
    paddingTop: stickyChrome ? theme.spacing(4) : undefined,
    position: pinned ? 'fixed' : undefined,
    top: alwaysVisible ? alwaysVisibleTop : debouncedSticky ? stickyTop : undefined,
    visibility: !alwaysVisible && debouncedSticky && debouncedScrollDown ? 'hidden' : 'visible',
    animation: anim,
    zIndex: pinned ? 100 : undefined,
    width: '100%',
    maxWidth: isMobile || isTablet || !hasNav ? '100vw' : `calc(100vw - ${LEFT_NAV_WIDTH}px)`,
  };

  return (
    <Box ref={ref} sx={styles}>
      {children}
    </Box>
  );
}
