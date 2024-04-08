import React, { useCallback, useMemo, useState } from 'react';

import { Box, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DropdownItem, PopoverMenu } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { MapViewStyle } from 'src/types/Map';

import { useMapPortalContainer } from './MapRenderUtils';

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

const useStyles = makeStyles((theme: Theme) => ({
  viewControl: {
    '& .MuiButtonBase-root': {
      padding: 0,
    },
    '& .MuiButtonBase-root.MuiMenuItem-root': {
      fontSize: '12px',
    },
    '& svg': {
      marginLeft: 0,
    },
  },
  viewControlSelected: {
    fontSize: '12px',
    paddingLeft: theme.spacing(0.5),
    color: theme.palette.TwClrTxt,
  },
}));

export type MapViewStyleControlProps = {
  mapViewStyle?: MapViewStyle;
  onChangeMapViewStyle: (style: MapViewStyle) => void;
};

const MapViewStyleControl = ({ mapViewStyle, onChangeMapViewStyle }: MapViewStyleControlProps): JSX.Element | null => {
  const classes = useStyles();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const mapPortalContainer = useMapPortalContainer();

  const setMapViewStyle = (item: DropdownItem) => {
    const style: MapViewStyle = item.value === 'Outdoors' ? 'Outdoors' : 'Satellite';
    onChangeMapViewStyle(style);
  };

  const viewOptions = useMemo<DropdownItem[]>(() => {
    if (!activeLocale) {
      return [];
    }
    return [
      { label: strings.OUTDOORS, value: 'Outdoors' },
      { label: strings.SATELLITE, value: 'Satellite' },
    ];
  }, [activeLocale]);

  if (mapPortalContainer) {
    return null;
  }

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
      }}
      className={classes.viewControl}
    >
      <PopoverMenu
        anchor={
          <span className={classes.viewControlSelected}>
            {mapViewStyle === 'Outdoors' ? strings.OUTDOORS : strings.SATELLITE}
          </span>
        }
        menuSections={[viewOptions]}
        onClick={setMapViewStyle}
      />
    </Box>
  );
};

export default MapViewStyleControl;
