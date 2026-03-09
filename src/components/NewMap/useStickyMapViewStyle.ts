import { useCallback, useState } from 'react';

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
  const [mapViewStyle, setMapViewStyle] = useState<MapViewStyle>(() => {
    const sessionStyle = getStyleFromSession(key);
    if (sessionStyle && (MapViewStyles as string[]).includes(sessionStyle)) {
      return sessionStyle as MapViewStyle;
    }
    return defaultStyle;
  });

  const updateMapViewStyle = useCallback(
    (newStyle: MapViewStyle) => {
      setMapViewStyle(newStyle);
      writeStyleToSession(key, newStyle);
    },
    [key]
  );

  return {
    mapViewStyle,
    updateMapViewStyle,
  };
};

export default useStickyMapViewStyle;
