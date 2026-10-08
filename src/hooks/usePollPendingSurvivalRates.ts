import { useEffect, useRef } from 'react';

import { API_PULL_INTERVAL } from 'src/constants';
import { baseApi } from 'src/queries/baseApi';
import { useGetSurvivalRateCalculationInProgressQuery } from 'src/queries/generated/plantingSites';
import { QueryTagTypes } from 'src/queries/tags';
import { useAppDispatch } from 'src/redux/store';

/**
 * While a site's displayed observation results are pending recalculation, polls the site's lightweight calculation
 * status and refetches its results once the calculation is done. Polling stops when the refetched results are no
 * longer pending.
 */
const usePollPendingSurvivalRates = (plantingSiteId: number | undefined, pending: boolean) => {
  const dispatch = useAppDispatch();
  const shouldPoll = pending && plantingSiteId !== undefined;

  const { currentData, fulfilledTimeStamp } = useGetSurvivalRateCalculationInProgressQuery(plantingSiteId ?? 0, {
    pollingInterval: !import.meta.env.PUBLIC_DISABLE_RECURRENT_REQUESTS ? API_PULL_INTERVAL : undefined,
    refetchOnMountOrArgChange: true,
    skip: !shouldPoll,
  });

  // A status fetched before the results became pending, or before the last refetch was requested, can't say whether
  // the results on screen are stale.
  const ignoreStatusBefore = useRef(0);
  useEffect(() => {
    if (shouldPoll) {
      ignoreStatusBefore.current = Date.now();
    }
  }, [plantingSiteId, shouldPoll]);

  useEffect(() => {
    if (
      shouldPoll &&
      currentData?.calculationInProgress === false &&
      fulfilledTimeStamp !== undefined &&
      fulfilledTimeStamp > ignoreStatusBefore.current
    ) {
      ignoreStatusBefore.current = Date.now();
      dispatch(
        baseApi.util.invalidateTags([
          { type: QueryTagTypes.PlantingSiteSurvivalRate, id: plantingSiteId },
          { type: QueryTagTypes.PlantingSiteObservation, id: plantingSiteId },
          { type: QueryTagTypes.TrackingStats },
        ])
      );
    }
  }, [currentData, dispatch, fulfilledTimeStamp, plantingSiteId, shouldPoll]);
};

export default usePollPendingSurvivalRates;
