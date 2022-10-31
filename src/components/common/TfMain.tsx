import React, { useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

const TOP_BAR_HEIGHT = 64;

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    background: theme.palette.TwClrBg,
    minHeight: `calc(100vh - ${TOP_BAR_HEIGHT}px)`,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
  headerFixed: {
    position: 'fixed',
    top: `${TOP_BAR_HEIGHT}px`,
    width: '-webkit-fill-available',
    background: `${theme.palette.TwClrBg} !important`,
    boxShadow: `0px 3px 3px -3px ${theme.palette.TwClrBaseGray200}`,
    zIndex: 100,
  },
  hide: {
    visibility: 'hidden',
  },
}));

/**
 * TfMain Component Props
 * children The child components to be rendered within this element on the page
 * headerElement The HTMLElement that corresponds to the header of the page
 * contentElement The HTMLElement immediately following the header element
 * headerHeight The height of the header in pixels
 */
interface Props {
  children?: React.ReactNode;
  headerElement?: HTMLElement | null;
  contentElement?: HTMLElement | null;
  headerHeight?: number;
}

export default function TfMain({ children, headerElement, contentElement, headerHeight }: Props): JSX.Element {
  const classes = useStyles();

  useEffect(() => {
    if (!(headerElement && contentElement && headerHeight)) {
      return;
    }

    let lastScrollY = 0;
    const headerClasses = headerElement.className;
    const handleScroll = (ev: Event) => {
      if (window.scrollY > headerHeight) {
        const delta = window.scrollY - lastScrollY;
        headerElement.className = `${headerClasses} ${classes.headerFixed} ${delta > 0 ? ' ' + classes.hide : ''}`;
        contentElement.style.marginTop = `${headerHeight}px`;
      } else {
        headerElement.className = headerClasses;
        contentElement.style.marginTop = '0px';
      }

      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerElement, contentElement, headerHeight, classes.headerFixed, classes.hide]);

  return <main className={classes.main}>{children}</main>;
}
