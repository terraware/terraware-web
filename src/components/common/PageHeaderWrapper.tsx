import React, { useLayoutEffect, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';
import useDebounce from '../../utils/useDebounce';

const TOP_BAR_HEIGHT = 64;
const DEBOUNCE_TIME = 500;

/**
 * children The child component which is the page header
 * nextElement The HTMLElement immediately following the header element
 */
interface Props {
  children?: React.ReactChild | React.ReactChild[];
  nextElement?: HTMLElement | null;
}

export default function PageHeaderWrapper({ children, nextElement }: Props): JSX.Element {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);
  const [scrollDown, setScrollDown] = useState(false);
  const [height, setHeight] = useState<number>(0);
  const [anim, setAnim] = useState<string | undefined>(undefined);
  const debouncedSticky = useDebounce(sticky, DEBOUNCE_TIME);
  const debouncedScrollDown = useDebounce(scrollDown, DEBOUNCE_TIME);
  const lastDebouncedSticky = useRef(false);

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
    const handleScroll = (ev: Event) => {
      const delta = window.scrollY - lastScrollY;
      setScrollDown(delta > 0);

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
      nextElement.style.marginTop = `${debouncedSticky ? height : 0}px`;
    }
  }, [nextElement, height, debouncedSticky]);

  useLayoutEffect(() => {
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
  }, [debouncedSticky, debouncedScrollDown, height]);

  const styles: Record<string, any> = {
    background: debouncedSticky ? theme.palette.TwClrBg : undefined,
    boxShadow: debouncedSticky ? `0px 3px 3px -3px ${theme.palette.TwClrBaseGray200}` : undefined,
    paddingRight: debouncedSticky ? theme.spacing(3) : undefined,
    position: debouncedSticky ? 'fixed' : undefined,
    top: debouncedSticky ? (debouncedScrollDown ? `${TOP_BAR_HEIGHT - height}px` : `${TOP_BAR_HEIGHT}px`) : undefined,
    visibility: debouncedSticky && debouncedScrollDown ? 'hidden' : 'visible',
    animation: anim,
    width: '-webkit-fill-available',
    zIndex: debouncedSticky ? 100 : undefined,
  };

  return (
    <Box ref={ref} sx={styles}>
      {children}
    </Box>
  );
}
