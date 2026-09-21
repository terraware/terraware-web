import { useCallback, useEffect } from 'react';

import { MAPBOX_TOKEN_REFRESH_SECONDS } from 'src/constants';
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

  const { currentData, isError, fulfilledTimeStamp, refetch } = useGetMapboxTokenQuery(undefined, {
    pollingInterval: MAPBOX_TOKEN_REFRESH_SECONDS * 1000,
    refetchOnMountOrArgChange: MAPBOX_TOKEN_REFRESH_SECONDS,
  });

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
