import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getMapboxToken } from 'src/api/tracking/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import Map from './Map';
import { MapOptions } from './MapModels';

const DUMMY_MAP_OPTIONS: MapOptions = {
  bbox: {
    lowerLeft: [0, 0],
    upperRight: [0, 0],
  },
  sources: [],
};

type GenericMapProps = {
  style?: object;
};

export default function GenericMap({ style }: GenericMapProps): JSX.Element | null {
  const [snackbar] = useState(useSnackbar());
  const [token, setToken] = useState<string>();
  const [mapId, setMapId] = useState<string>();

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

  useEffect(() => {
    if (token) {
      return;
    }
    fetchMapboxToken();
  }, [mapId, token, fetchMapboxToken]);

  if (!token) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', margin: 'auto' }}>
        <CircularProgress sx={{ margin: 'auto' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      <Map token={token} options={DUMMY_MAP_OPTIONS} onTokenExpired={fetchMapboxToken} mapId={mapId} style={style} />
    </Box>
  );
}
