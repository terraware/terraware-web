import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

const TOP_BAR_HEIGHT = 64;

const useStyles = makeStyles((theme: Theme) => ({
  headerFixed: {
    position: 'fixed',
    top: `${TOP_BAR_HEIGHT}px`,
    width: '-webkit-fill-available',
    background: theme.palette.TwClrBg,
    boxShadow: `0px 3px 3px -3px ${theme.palette.TwClrBaseGray200}`,
    zIndex: 100,
  },
  hide: {
    visibility: 'hidden',
  },
}));

/**
 * children The child component which is the page header
 * nextElement The HTMLElement immediately following the header element
 */
interface Props {
  children?: React.ReactChild;
  nextElement?: HTMLElement | null;
}

export default function PageHeaderWrapper({ children, nextElement }: Props): JSX.Element {
  const classes = useStyles();
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

  return (
    <div ref={ref} className={`${sticky ? classes.headerFixed : ''} ${scrollDown && sticky ? classes.hide : ''}`}>
      {children}
    </div>
  );
}
