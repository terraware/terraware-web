import { useCallback, useEffect, useState } from 'react';

import { MapService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';

import { getTokenFromSession, writeTokenToSession } from './storage';

interface MapboxToken {
  /**
   * Identifier to pass to the ReactMapGL component. Updated every time a new token is fetched;
   * passing this to the map component forces the map to be re-rendered using the new token.
   */
  mapId?: string;

  /**
   * Callback that forces the token to be refreshed. Typically called from an error handler if the
   * Mapbox API returns HTTP 401.
   */
  refreshToken: () => void;

  /** API token. Undefined if the request to fetch the token is still in progress. */
  token?: string;
}

export default function useMapboxToken(): MapboxToken {
  const snackbar = useSnackbar();
  const [token, setToken] = useState<string>();
  const [mapId, setMapId] = useState<string>();
  const [tokenPromise, setTokenPromise] = useState<Promise<void>>();

  // fetch token
  const fetchMapboxToken = useCallback(async () => {
    // Pull from session storage, otherwise fetch a new token from the backend
    const _token = getTokenFromSession();
    if (_token) {
      setToken(_token);
      setMapId(Date.now().toString());
      return;
    }

    const response = await MapService.getMapboxToken();
    if (response.requestSucceeded && response.token) {
      setToken(response.token);
      setMapId(Date.now().toString());
      writeTokenToSession(response.token);
    } else {
      snackbar.toastError();
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

  return { mapId, refreshToken, token };
}
