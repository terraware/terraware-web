import { useMemo } from 'react';

import { useTheme } from '@mui/material';

import { MapFillComponentStyle, MapIconComponentStyle } from './types';

const useMapFeatureStyles = () => {
  const theme = useTheme();

  const observationEventStyle = useMemo(
    (): MapFillComponentStyle => ({
      fillColor: theme.palette.TwClrBasePink200,
      type: 'fill',
    }),
    [theme]
  );

  const sitesLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBaseGreen300,
      fillColor: theme.palette.TwClrBaseGreen300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const strataLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBasePurple300,
      fillColor: theme.palette.TwClrBasePurple300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const substrataLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBaseBlue300,
      fillColor: theme.palette.TwClrBaseBlue300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const permanentPlotsLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBasePink300,
      fillColor: theme.palette.TwClrBasePink300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const temporaryPlotsLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBaseYellow300,
      fillColor: theme.palette.TwClrBaseYellow300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const adHocPlotsLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBaseOrange300,
      fillColor: theme.palette.TwClrBaseOrange300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const plotPhotoStyle = useMemo(
    (): MapIconComponentStyle => ({
      iconColor: '#CC79A7',
      iconName: 'iconPhoto',
      type: 'icon',
    }),
    []
  );

  const virtualPlotStyle = useMemo(
    (): MapIconComponentStyle => ({
      iconColor: '#CC79A7',
      iconName: 'iconFolder',
      type: 'icon',
    }),
    []
  );

  const livePlantStyle = useMemo(
    (): MapIconComponentStyle => ({
      iconColor: '#40B0A6',
      iconName: 'iconRestorationSite',
      type: 'icon',
    }),
    []
  );

  const deadPlantStyle = useMemo(
    (): MapIconComponentStyle => ({
      iconColor: '#E1BE6A',
      iconName: 'iconRestorationSite',
      type: 'icon',
    }),
    []
  );

  const survivalRateLessThan50 = useMemo(
    (): MapFillComponentStyle => ({
      fillPatternUrl: '/assets/survival-rate-less-50.png',
      opacity: 1.0,
      type: 'fill',
    }),
    []
  );

  const survivalRate50To75 = useMemo(
    (): MapFillComponentStyle => ({
      fillPatternUrl: '/assets/survival-rate-more-50.png',
      opacity: 1.0,
      type: 'fill',
    }),
    []
  );

  const survivalRateMoreThan75 = useMemo(
    (): MapFillComponentStyle => ({
      fillPatternUrl: '/assets/survival-rate-more-75.png',
      opacity: 1.0,
      type: 'fill',
    }),
    []
  );

  return {
    adHocPlotsLayerStyle,
    deadPlantStyle,
    livePlantStyle,
    observationEventStyle,
    permanentPlotsLayerStyle,
    plotPhotoStyle,
    virtualPlotStyle,
    sitesLayerStyle,
    substrataLayerStyle,
    survivalRateLessThan50,
    survivalRate50To75,
    survivalRateMoreThan75,
    temporaryPlotsLayerStyle,
    strataLayerStyle,
  };
};

export default useMapFeatureStyles;
