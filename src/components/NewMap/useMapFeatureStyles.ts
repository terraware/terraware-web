import { useMemo } from 'react';

import { useTheme } from '@mui/material';

import { MapFillComponentStyle, MapIconComponentStyle } from './types';

const useMapFeatureStyles = () => {
  const theme = useTheme();

  const sitesLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBaseGreen300,
      fillColor: theme.palette.TwClrBaseGreen300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const zonesLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBasePurple300,
      fillColor: theme.palette.TwClrBasePurple300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const subzonesLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBaseBlue300,
      fillColor: theme.palette.TwClrBaseBlue300,
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

  const livePlantStyle = useMemo(
    (): MapIconComponentStyle => ({
      iconColor: '#40B0A6',
      iconName: 'iconLivePlant',
      type: 'icon',
    }),
    []
  );

  const deadPlantStyle = useMemo(
    (): MapIconComponentStyle => ({
      iconColor: '#E1BE6A',
      iconName: 'iconLivePlant',
      type: 'icon',
    }),
    []
  );

  return {
    deadPlantStyle,
    livePlantStyle,
    plotPhotoStyle,
    sitesLayerStyle,
    subzonesLayerStyle,
    zonesLayerStyle,
  };
};

export default useMapFeatureStyles;
