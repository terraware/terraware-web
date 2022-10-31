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
  const [height, setHeight] = useState<number>();

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
      const scrolled = window.scrollY > (height ?? 0);
      const delta = window.scrollY - lastScrollY;
      setSticky(scrolled);
      setScrollDown(delta > 0);
      if (nextElement) {
        nextElement.style.marginTop = `${scrolled ? height : 0}px`;
      }

      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [children, nextElement, height]);

  const styles = useMemo<Record<string, any>>(
    () => ({
      visibility: scrollDown && sticky ? 'hidden' : 'visible',
      position: sticky ? 'fixed' : undefined,
      top: sticky ? `${TOP_BAR_HEIGHT}px` : undefined,
      width: sticky ? '-webkit-fill-available' : undefined,
      background: sticky ? theme.palette.TwClrBg : undefined,
      boxShadow: sticky ? `0px 3px 3px -3px ${theme.palette.TwClrBaseGray200}` : undefined,
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
