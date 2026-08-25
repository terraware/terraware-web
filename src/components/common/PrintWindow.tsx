import React, { type JSX, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import createCache, { type EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Box } from '@mui/material';

import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import useSnackbar from 'src/utils/useSnackbar';

const MARGIN_INCHES = 0.5;
const CSS_PIXELS_PER_INCH = 96;

const PAGE_WIDTH = (8.5 - MARGIN_INCHES * 2) * CSS_PIXELS_PER_INCH;

const CONTENT_WIDTH = 1024;

const PRINT_STYLES = `
  @page { margin: ${MARGIN_INCHES}in; }

  html, body { background: #fff; margin: 0; padding: 0; }

  /* progress bars, status badges and the health bar are drawn as background colour alone, and
     browsers drop background graphics from print output unless asked not to */
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

  .print-root { width: ${CONTENT_WIDTH}px; }

  .print-section { break-inside: avoid; }

  @media print {
    .print-toolbar { display: none !important; }

    .print-root { zoom: ${PAGE_WIDTH / CONTENT_WIDTH}; }
  }
`;

/**
 * Returns a promise for the linked stylesheets, which are fetched again by the new document. Nothing
 * should print until they land, or the document goes to the printer unstyled.
 */
const copyStyles = (source: Document, target: Document): Promise<unknown> => {
  const linksLoaded: Promise<unknown>[] = [];

  source.head.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const clone = link.cloneNode(true) as HTMLLinkElement;

    linksLoaded.push(
      new Promise((resolve) => {
        clone.addEventListener('load', resolve, { once: true });
        clone.addEventListener('error', resolve, { once: true });
      })
    );

    target.head.appendChild(clone);
  });

  source.head.querySelectorAll('style').forEach((style) => {
    const clone = target.createElement('style');

    if (style.textContent) {
      clone.textContent = style.textContent;
    } else {
      // In a production build emotion inserts through the CSSOM, which leaves the <style> element
      // itself empty; cloning the node would silently drop every rule in it.
      try {
        clone.textContent = Array.from(style.sheet?.cssRules ?? [])
          .map((rule) => rule.cssText)
          .join('\n');
      } catch {
        // a cross-origin sheet, already covered by the cloned <link>
        return;
      }
    }

    target.head.appendChild(clone);
  });

  return Promise.all(linksLoaded);
};

type PortalTarget = {
  cache: EmotionCache;
  container: HTMLElement;
  stylesLoaded: Promise<unknown>;
};

export type PrintWindowProps = {
  children: ReactNode;
  onClose: () => void;
  /** the print dialog opens by itself once this turns true, so the content is never cut short */
  ready?: boolean;
  title: string;
};

const PrintWindow = ({ children, onClose, ready, title }: PrintWindowProps): JSX.Element | null => {
  const { strings } = useLocalization();
  const snackbar = useSnackbar();

  const [target, setTarget] = useState<PortalTarget | null>(null);

  const windowRef = useRef<Window | null>(null);
  const openedRef = useRef(false);
  const printedRef = useRef(false);

  useEffect(() => {
    if (openedRef.current) {
      return;
    }
    openedRef.current = true;

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      snackbar.toastError(strings.PRINT_WINDOW_BLOCKED);
      onClose();
      return;
    }

    windowRef.current = printWindow;

    const stylesLoaded = copyStyles(document, printWindow.document);

    const printStyle = printWindow.document.createElement('style');
    printStyle.textContent = PRINT_STYLES;
    printWindow.document.head.appendChild(printStyle);

    const container = printWindow.document.createElement('div');
    printWindow.document.body.appendChild(container);

    printWindow.addEventListener('beforeunload', onClose);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTarget({
      // prepended so the copied stylesheets can still override MUI, as `injectFirst` arranges in the app
      cache: createCache({ container: printWindow.document.head, key: 'twprint', prepend: true }),
      container,
      stylesLoaded,
    });
  }, [onClose, snackbar, strings]);

  useEffect(() => {
    if (windowRef.current) {
      // the title is what the browser offers as the PDF filename
      windowRef.current.document.title = title;
    }
  }, [target, title]);

  useEffect(
    () => () => {
      windowRef.current?.close();
    },
    []
  );

  useEffect(() => {
    const printWindow = windowRef.current;

    if (!target || !ready || !printWindow || printedRef.current) {
      return;
    }
    printedRef.current = true;

    let cancelled = false;

    const print = () =>
      printWindow.requestAnimationFrame(() => {
        if (!cancelled) {
          printWindow.print();
        }
      });

    void target.stylesLoaded
      .then(() => printWindow.document.fonts.ready)
      .then(() => {
        if (!cancelled) {
          printWindow.requestAnimationFrame(print);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ready, target]);

  const onPrint = useCallback(() => windowRef.current?.print(), []);

  if (!target) {
    return null;
  }

  return createPortal(
    <CacheProvider value={target.cache}>
      <Box className='print-root'>
        <Box className='print-toolbar' display='flex' justifyContent='flex-end' padding={2}>
          <Button label={strings.PRINT} onClick={onPrint} size='medium' />
        </Box>

        {children}
      </Box>
    </CacheProvider>,
    target.container
  );
};

export default PrintWindow;
