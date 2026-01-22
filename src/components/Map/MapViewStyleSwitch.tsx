import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { MapViewStyle } from 'src/types/Map';
import { getRgbaFromHex } from 'src/utils/color';

export const useMapViewStyle = (): [MapViewStyle, (style: MapViewStyle) => void] => {
  const [mapViewStyle, setMapViewStyle] = useState<MapViewStyle>(
    localStorage.getItem('mapViewStyle') === 'Outdoors' ? 'Outdoors' : 'Satellite'
  );

  const onChangeMapViewStyle = useCallback(
    (viewStyle: MapViewStyle) => {
      setMapViewStyle(viewStyle);
      localStorage.setItem('mapViewStyle', viewStyle);
    },
    [setMapViewStyle]
  );

  return useMemo<[MapViewStyle, (style: MapViewStyle) => void]>(
    () => [mapViewStyle, onChangeMapViewStyle],
    [mapViewStyle, onChangeMapViewStyle]
  );
};

export type MapViewStyleSwitchProps = {
  mapViewStyle?: MapViewStyle;
  onChangeMapViewStyle: (style: MapViewStyle) => void;
};

const MapViewStyleSwitch = ({ mapViewStyle, onChangeMapViewStyle }: MapViewStyleSwitchProps): JSX.Element | null => {
  const theme = useTheme();

  const renderSelector = (selectorMapStyle: MapViewStyle) => {
    const title: string = selectorMapStyle === 'Outdoors' ? strings.OUTDOORS : strings.SATELLITE;
    const isSelected = mapViewStyle === selectorMapStyle;
    return (
      <Box
        width={'auto'}
        minWidth={'67px'}
        borderRadius={theme.spacing(0.75)}
        padding={theme.spacing(0.5)}
        gap={theme.spacing(0.75)}
        sx={{
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          background: isSelected ? theme.palette.TwClrBaseWhite : 'transparent',
          boxShadow: isSelected
            ? `0.0px 2.0px 4.0px 0px ${getRgbaFromHex(theme.palette.TwClrBaseGray800 as string, 0.2)}`
            : 'none',
          cursor: 'pointer',
        }}
        onClick={() => onChangeMapViewStyle(selectorMapStyle)}
      >
        <Typography
          fontSize='16px'
          fontWeight={400}
          lineHeight='24px'
          textAlign='center'
          color={theme.palette.TwClrTxt}
        >
          {title}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      justifyContent='space-between'
      minWidth={'152px'}
      borderRadius={theme.spacing(1)}
      padding={theme.spacing(0.5)}
      gap={theme.spacing(0.5)}
      style={{ backgroundColor: theme.palette.TwClrBgSecondary }}
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      {renderSelector('Outdoors')}
      {renderSelector('Satellite')}
    </Box>
  );
};

export default MapViewStyleSwitch;
