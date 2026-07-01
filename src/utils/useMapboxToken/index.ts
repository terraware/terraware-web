import { useCallback, useEffect } from 'react';

import { useGetMapboxTokenQuery } from 'src/queries/generated/mapbox';
import useSnackbar from 'src/utils/useSnackbar';

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

  // The cached token persists well beyond its 30 minute lifetime (see the extension's
  // keepUnusedDataFor). refreshToken forces a new fetch when Mapbox rejects the token as invalid.
  const { currentData, isError, fulfilledTimeStamp, refetch } = useGetMapboxTokenQuery();

  useEffect(() => {
    if (isError) {
      snackbar.toastError();
    }
  }, [isError, snackbar]);

  const refreshToken = useCallback(() => {
    void refetch();
  }, [refetch]);

  const token = currentData?.token;
  // fulfilledTimeStamp changes on every successful fetch, so mapId changes whenever a new token is
  // fetched, forcing the map to re-render with the fresh token.
  const mapId = token && fulfilledTimeStamp ? fulfilledTimeStamp.toString() : undefined;

  return { mapId, refreshToken, token };
}
