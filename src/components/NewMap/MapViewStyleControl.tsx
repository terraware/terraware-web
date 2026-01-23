import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { DropdownItem, PopoverMenu } from '@terraware/web-components';

import { MapViewStyle, MapViewStyles } from './types';

type MapViewStyleControlProps = {
  containerId?: string;
  mapViewStyle: MapViewStyle;
  mapViewStyleNames?: (style: MapViewStyle) => string;
  setMapViewStyle: (style: MapViewStyle) => void;
};

const MapViewStyleControl = ({
  containerId,
  mapViewStyle,
  mapViewStyleNames,
  setMapViewStyle,
}: MapViewStyleControlProps): JSX.Element | undefined => {
  const theme = useTheme();

  const viewOptions = useMemo((): DropdownItem[] => {
    return MapViewStyles.map((style) => ({
      label: mapViewStyleNames?.(style) ?? style,
      value: style,
    }));
  }, [mapViewStyleNames]);

  const onSelectMapViewStyle = useCallback(
    (item: DropdownItem) => {
      setMapViewStyle(item.value as MapViewStyle);
    },
    [setMapViewStyle]
  );

  const container = useMemo(() => {
    if (containerId) {
      return document.getElementById(containerId);
    }
  }, [containerId]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '10px',
        left: '45px',
        zIndex: 10,
        height: 28,
        backgroundColor: `${theme.palette.TwClrBaseWhite}`,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        '& .MuiButtonBase-root': {
          padding: 0,
        },
        '& .MuiButtonBase-root.MuiMenuItem-root': {
          fontSize: '12px',
        },
        '& svg': {
          marginLeft: 0,
        },
      }}
    >
      <PopoverMenu
        anchor={
          <Box
            component='span'
            sx={{
              fontSize: '12px',
              paddingLeft: theme.spacing(0.5),
              color: theme.palette.TwClrTxt,
            }}
          >
            {mapViewStyleNames?.(mapViewStyle) ?? mapViewStyle}
          </Box>
        }
        container={container}
        menuSections={[viewOptions]}
        onClick={onSelectMapViewStyle}
      />
    </Box>
  );
};

export default MapViewStyleControl;
