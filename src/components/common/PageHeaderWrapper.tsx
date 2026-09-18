import React, { type JSX, useLayoutEffect, useRef, useState } from 'react';

import { Box, IconButton, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';
import { Icon } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import useDebounce from '../../utils/useDebounce';

const TOP_BAR_HEIGHT = 64;
const DEBOUNCE_TIME = 500;
const LEFT_NAV_WIDTH = 220;
// Matches the top padding of the main element, so a pinned header sits where it would in flow.
const HEADER_TOP_GAP = 32;
const EAR_HEIGHT = 24;

/**
 * alwaysVisible Keep the header pinned below the top bar instead of hiding it while scrolling down
 * children The child component which is the page header
 * elevated Give the header a persistent divider and soft drop shadow, regardless of scroll, to
 *   signal it holds pending actions (such as unsaved edits)
 * collapsible Show an ear under the header that hides and shows it
 * hasNav Whether the left navigation is present, used to compute the pinned header's max width
 * nextElement The HTMLElement immediately following the header element
 * nextElementInitialMargin Base top margin kept on nextElement before the header's height is added
 */
interface Props {
  alwaysVisible?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  elevated?: boolean;
  collapsible?: boolean;
  hasNav?: boolean;
  nextElement?: HTMLElement | null;
  nextElementInitialMargin?: number;
}

export default function PageHeaderWrapper({
  alwaysVisible = false,
  children,
  elevated = false,
  collapsible = false,
  hasNav = true,
  nextElement,
  nextElementInitialMargin = 0,
}: Props): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();
  const ref = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollDown, setScrollDown] = useState(false);
  const [height, setHeight] = useState<number>(0);
  const [anim, setAnim] = useState<string | undefined>(undefined);
  const [hidden, setHidden] = useState(false);
  const debouncedSticky = useDebounce(sticky, DEBOUNCE_TIME);
  const debouncedScrollDown = useDebounce(scrollDown, DEBOUNCE_TIME);
  const lastDebouncedSticky = useRef(false);
  const { isMobile, isTablet } = useDeviceInfo();

  useLayoutEffect(() => {
    const header = ref.current;
    if (!header) {
      return;
    }

    setHeight(header.clientHeight);

    // The header also changes height when its own content expands, such as a filters panel.
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => setHeight(header.clientHeight));
    observer.observe(header);

    return () => observer.disconnect();
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
    if (!scrolled && hidden) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHidden(false);
    }
  }, [hidden, scrolled]);

  useLayoutEffect(() => {
    if (nextElement) {
      const headerHeight = alwaysVisible || debouncedSticky ? height : 0;
      const earHeight = collapsible && scrolled ? EAR_HEIGHT : 0;
      nextElement.style.marginTop = `${nextElementInitialMargin + headerHeight + earHeight}px`;
    }
  }, [alwaysVisible, collapsible, nextElement, height, debouncedSticky, nextElementInitialMargin, scrolled]);

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

  const showEar = collapsible && scrolled;
  const isHidden = showEar && hidden;
  const pinned = alwaysVisible || debouncedSticky;
  // An always visible header is fixed from the top of the page, so it only takes on the sticky
  // chrome (background, divider, gap filling padding) once content scrolls underneath it.
  const stickyChrome = (alwaysVisible ? scrolled : debouncedSticky) && !isHidden;
  // An elevated header keeps its divider (and gains a soft shadow) at all times, so pending
  // actions read as raised off the page even before the user scrolls.
  const showDivider = elevated || stickyChrome;

  const stickyTop = debouncedScrollDown ? `${TOP_BAR_HEIGHT - height}px` : `${TOP_BAR_HEIGHT}px`;
  const alwaysVisibleTop = scrolled && !isHidden ? `${TOP_BAR_HEIGHT}px` : `${TOP_BAR_HEIGHT + HEADER_TOP_GAP}px`;

  const styles: Record<string, any> = {
    background: stickyChrome ? theme.palette.TwClrBaseGray025 : undefined,
    borderBottom: showDivider ? '1px solid' : '1px transparent',
    borderImage: showDivider
      ? `linear-gradient(to right, ${theme.palette.TwClrBaseGray300}00,` +
        `${theme.palette.TwClrBaseGray300}FF, ${theme.palette.TwClrBaseGray300}FF,` +
        `${theme.palette.TwClrBaseGray300}FF, ${theme.palette.TwClrBaseGray300}00) 1`
      : undefined,
    boxShadow: elevated ? `0px 4px 8px ${theme.palette.TwClrBaseGray300}66` : 'none',
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
      {!isHidden && children}
      {showEar && (
        <Box sx={{ left: theme.spacing(5), lineHeight: 0, position: 'absolute', top: '100%' }}>
          <IconButton
            aria-label={isHidden ? strings.SHOW_TITLE_BAR : strings.HIDE_TITLE_BAR}
            id='toggle-title-bar'
            onClick={() => setHidden(!hidden)}
            sx={{
              background: theme.palette.TwClrBaseGray025,
              border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              borderRadius: '0 0 8px 8px',
              borderTop: 'none',
              height: `${EAR_HEIGHT}px`,
              padding: 0,
              width: '48px',
              '&:hover': {
                background: theme.palette.TwClrBgSecondaryHover,
              },
            }}
          >
            <Icon name={isHidden ? 'chevronDown' : 'chevronUp'} size='small' />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
