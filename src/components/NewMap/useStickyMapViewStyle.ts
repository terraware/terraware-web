import { useCallback, useEffect, useState } from 'react';

import { MapViewStyle, MapViewStyles } from './types';

type StickyMapViewStyleProps = {
  defaultStyle: MapViewStyle;
  key: string;
};

const getStyleFromSession = (key: string): string => {
  try {
    return sessionStorage.getItem(key) || '';
  } catch (e) {
    return '';
  }
};

const writeStyleToSession = (key: string, style: MapViewStyle): void => {
  try {
    sessionStorage.setItem(key, style);
  } catch (e) {
    /* empty */
  }
};

const useStickyMapViewStyle = ({ defaultStyle, key }: StickyMapViewStyleProps) => {
  const [mapViewStyle, setMapViewStyle] = useState(defaultStyle);

  const updateMapViewStyle = useCallback(
    (newStyle: MapViewStyle) => {
      setMapViewStyle(newStyle);
      writeStyleToSession(key, newStyle);
    },
    [key]
  );

  useEffect(() => {
    // If there is a "last viewed" tab in the session, use that, otherwise send to default
    const sessionStyle = getStyleFromSession(key);
    if (sessionStyle && (MapViewStyles as string[]).includes(sessionStyle)) {
      setMapViewStyle(sessionStyle as MapViewStyle);
      return;
    }
  }, [key]);

  return {
    mapViewStyle,
    updateMapViewStyle,
  };
};

export default useStickyMapViewStyle;
