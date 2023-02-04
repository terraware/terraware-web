import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { MapService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import Map from './Map';
import { MapEntityOptions, MapOptions, MapPopupRenderer } from 'src/types/Map';

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
  bannerMessage?: string;
  entityOptions?: MapEntityOptions;
};

export default function GenericMap({
  contextRenderer,
  options,
  style,
  bannerMessage,
  entityOptions,
}: GenericMapProps): JSX.Element | null {
  const snackbar = useSnackbar();
  const [token, setToken] = useState<string>();
  const [mapId, setMapId] = useState<string>();
  const [tokenPromise, setTokenPromise] = useState<Promise<void>>();

  // fetch token
  const fetchMapboxToken = useCallback(async () => {
    const response = await MapService.getMapboxToken();
    if (response.requestSucceeded) {
      setToken(response.token);
      setMapId(Date.now().toString());
    } else {
      snackbar.toastError(response.error);
    }
  }, [snackbar]);

  const refreshToken = useCallback(() => {
    const promise = fetchMapboxToken();
    setTokenPromise(promise);
  }, [fetchMapboxToken]);

  const getToken = useCallback(() => {
    if (tokenPromise) {
      return;
    }
    refreshToken();
  }, [tokenPromise, refreshToken]);

  useEffect(() => {
    getToken();
  }, [getToken]);

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
      />
    </Box>
  );
}
