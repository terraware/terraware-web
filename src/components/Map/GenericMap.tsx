import React, { type JSX } from 'react';

import { Box, CircularProgress } from '@mui/material';

import { MapControl, MapEntityOptions, MapOptions, MapPopupRenderer, MapViewStyle } from 'src/types/Map';
import useMapboxToken from 'src/utils/useMapboxToken';

import Map, { MapImage } from './Map';

const DUMMY_MAP_OPTIONS: MapOptions = {
  bbox: {
    lowerLeft: [0, 0],
    upperRight: [0, 0],
  },
  sources: [],
};

type GenericMapProps = {
  contextRenderer?: MapPopupRenderer;
  options?: MapOptions;
  style?: object;
  mapViewStyle?: MapViewStyle;
  bannerMessage?: string;
  bottomRightLabel?: React.ReactNode;
  entityOptions?: MapEntityOptions;
  mapImages?: MapImage[];
  showSiteMarker?: boolean;
  layerIdOrder?: string[];
} & MapControl;

export default function GenericMap(props: GenericMapProps): JSX.Element | null {
  const {
    contextRenderer,
    options,
    style,
    bannerMessage,
    bottomRightLabel,
    entityOptions,
    mapImages,
    mapViewStyle,
    showSiteMarker,
    layerIdOrder,
  } = props;
  const { ...mapControlProps }: MapControl = props;

  const { token, mapId, refreshToken } = useMapboxToken();

  if (!token) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', margin: 'auto' }}>
        <CircularProgress sx={{ margin: 'auto' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      <Map
        token={token}
        options={options || DUMMY_MAP_OPTIONS}
        onTokenExpired={refreshToken}
        mapId={mapId}
        style={style}
        popupRenderer={contextRenderer}
        bannerMessage={bannerMessage}
        entityOptions={entityOptions}
        mapImages={mapImages}
        mapViewStyle={mapViewStyle}
        bottomRightLabel={bottomRightLabel}
        showSiteMarker={showSiteMarker}
        layerIdOrder={layerIdOrder}
        {...mapControlProps}
      />
    </Box>
  );
}
