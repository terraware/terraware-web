import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';

const TOP_BAR_HEIGHT = 64;

/**
 * children The child component which is the page header
 * nextElement The HTMLElement immediately following the header element
 */
interface Props {
  children?: React.ReactChild;
  nextElement?: HTMLElement | null;
}

export default function PageHeaderWrapper({ children, nextElement }: Props): JSX.Element {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);
  const [scrollDown, setScrollDown] = useState(false);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  }, [children, ref]);

  useEffect(() => {
    if (!children) {
      return;
    }

    let lastScrollY = 0;
    const handleScroll = (ev: Event) => {
      const delta = window.scrollY - lastScrollY;
      setScrollDown(delta > 0);

      const scrolledBelowHeader = window.scrollY > height;
      /*
       * If sticky was already set, and we are scrolling towards the top, don't unset it
       * until we've reached the top of the page as long as we continue to scroll upward.
       */
      const shouldSetSticky = scrolledBelowHeader || (sticky && delta < 0 && window.scrollY > 0);
      setSticky(shouldSetSticky);
      if (nextElement) {
        nextElement.style.marginTop = `${shouldSetSticky ? height : 0}px`;
      }

      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [children, nextElement, height, sticky]);

  const styles = useMemo<Record<string, any>>(
    () => ({
      background: sticky ? theme.palette.TwClrBg : undefined,
      boxShadow: sticky ? `0px 3px 3px -3px ${theme.palette.TwClrBaseGray200}` : undefined,
      paddingTop: sticky ? theme.spacing(3) : undefined,
      paddingRight: sticky ? theme.spacing(3) : undefined,
      position: sticky ? 'fixed' : undefined,
      top: sticky ? `${TOP_BAR_HEIGHT}px` : undefined,
      visibility: scrollDown && sticky ? 'hidden' : 'visible',
      width: sticky ? '-webkit-fill-available' : undefined,
      zIndex: sticky ? 100 : undefined,
    }),
    [theme, sticky, scrollDown]
  );

  return (
    <Box ref={ref} sx={styles}>
      {children}
    </Box>
  );
}
