import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getMapboxToken } from 'src/api/tracking/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import Map from './Map';
import { MapEntityId, MapOptions, MapPopupRenderer } from './MapModels';

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
  highlightEntity?: MapEntityId;
};

export default function GenericMap({
  contextRenderer,
  options,
  style,
  bannerMessage,
  highlightEntity,
}: GenericMapProps): JSX.Element | null {
  const [snackbar] = useState(useSnackbar());
  const [token, setToken] = useState<string>();
  const [mapId, setMapId] = useState<string>();
  const [tokenPromise, setTokenPromise] = useState<Promise<void>>();

  // fetch token
  const fetchMapboxToken = useCallback(async () => {
    const response = await getMapboxToken();
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
        highlightEntity={highlightEntity}
      />
    </Box>
  );
}
