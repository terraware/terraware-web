import React, { type JSX, useCallback, useEffect, useRef, useState } from 'react';

import { Box, SxProps, Theme } from '@mui/material';

import { redirectToLogin } from 'src/utils/login';

/**
 * The server only generates a few thumbnails at a time and answers 429 once a request has waited
 * too long for a slot, which is easy to hit on a page that asks for dozens of them at once. A 429
 * means "not ready yet", not "broken", so requests are retried with a growing, randomized delay and
 * the placeholder stays up until the last attempt fails.
 */
const UNAUTHORIZED = 401;
const TOO_MANY_REQUESTS = 429;
const MAX_ATTEMPTS = 4;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 10000;

const LOADING_IMAGE = '/assets/loading.gif';
const ERROR_IMAGE = '/assets/activity-media.svg';

// Random delay in the top half of the backoff window, so a page full of thumbnails spreads its
// retries out instead of hitting the limit again in lockstep.
const retryDelay = (attempt: number): number => {
  const window = Math.min(INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt), MAX_RETRY_DELAY_MS);
  return window / 2 + Math.random() * (window / 2);
};

const isServerImage = (src?: string): src is string => src !== undefined && src.startsWith('/api/');

export type ImageState = { src?: string; status: 'loading' | 'ready' | 'error' };

export const useThumbnailSrc = (src?: string, onError?: () => void): ImageState => {
  const [result, setResult] = useState<ImageState & { requestedSrc?: string }>({ status: 'loading' });

  // Kept in a ref so that a caller passing an inline function doesn't restart the request.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!isServerImage(src)) {
      return;
    }

    const controller = new AbortController();
    let objectUrl: string | undefined;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const fail = () => {
      setResult({ requestedSrc: src, status: 'error' });
      onErrorRef.current?.();
    };

    const request = async (attempt: number) => {
      try {
        const response = await fetch(src, { credentials: 'include', signal: controller.signal });
        if (cancelled) {
          return;
        }

        if (response.status === TOO_MANY_REQUESTS && attempt + 1 < MAX_ATTEMPTS) {
          retryTimeout = setTimeout(() => void request(attempt + 1), retryDelay(attempt));
          return;
        }

        // An expired session has to take the user to login the same way every other request does,
        // rather than making the photo look broken. Stay on the placeholder while we navigate away.
        if (response.status === UNAUTHORIZED) {
          redirectToLogin();
          return;
        }

        if (!response.ok) {
          fail();
          return;
        }

        const blob = await response.blob();
        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setResult({ requestedSrc: src, src: objectUrl, status: 'ready' });
      } catch {
        if (!cancelled) {
          fail();
        }
      }
    };

    void request(0);

    return () => {
      cancelled = true;
      controller.abort();
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (!isServerImage(src)) {
    return { src, status: 'ready' };
  }

  // Anything held over from a previous src is stale while the new one is being fetched.
  return result.requestedSrc === src ? result : { status: 'loading' };
};

export type ThumbnailImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onError' | 'src'> & {
  onError?: () => void;
  src: string;
  sx?: SxProps<Theme>;
};

/**
 * `height` and `width` are image attributes in pixels, but Box reads them as style props, where a
 * bare number is not valid CSS and a fraction would silently become a percentage.
 */
const cssSize = (value?: string | number): string | number | undefined =>
  typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) ? `${value}px` : value;

/**
 * Renders an image served by the API, retrying while the server is too busy to generate its
 * thumbnail. Images from anywhere else (local previews, bundled assets) are rendered as-is.
 */
const ThumbnailImage = ({ height, onError, src, sx, width, ...imgProps }: ThumbnailImageProps): JSX.Element => {
  const { src: resolvedSrc, status } = useThumbnailSrc(src, onError);
  const [undecodableSrc, setUndecodableSrc] = useState<string>();

  // A 2xx response is no guarantee that the bytes are an image the browser can draw, and only the
  // element finds that out, so a decode failure goes down the same path as a failed request.
  const failed = status === 'error' || (resolvedSrc !== undefined && resolvedSrc === undecodableSrc);

  const onImageError = useCallback(() => {
    // The placeholder is the end of the line; sending it back through here would loop.
    if (failed || resolvedSrc === undefined) {
      return;
    }

    setUndecodableSrc(resolvedSrc);
    onError?.();
  }, [failed, onError, resolvedSrc]);

  return (
    <Box
      component='img'
      {...imgProps}
      onError={onImageError}
      src={failed ? ERROR_IMAGE : resolvedSrc}
      sx={[
        { height: cssSize(height), width: cssSize(width) },
        status === 'loading' && {
          backgroundImage: `url(${LOADING_IMAGE})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '24px',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
};

export default ThumbnailImage;
