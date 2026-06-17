import { useEffect, useRef, useState } from 'react';

import { API_PULL_INTERVAL } from 'src/constants';
import { baseApi } from 'src/queries/baseApi';
import { useGetSurvivalRateCalculationInProgressQuery } from 'src/queries/generated/plantingSites';
import { QueryTagTypes } from 'src/queries/tags';
import { useAppDispatch } from 'src/redux/store';

/**
 * Polls the lightweight survival rate calculation status endpoint while a recalculation is in
 * progress for a planting site. When the calculation completes, invalidates that site's
 * observation results so the displayed survival rates refresh once.
 */
const useSurvivalRateCalculationInProgress = (plantingSiteId: number | undefined) => {
  const dispatch = useAppDispatch();
  const [isPolling, setIsPolling] = useState(false);

  const { currentData } = useGetSurvivalRateCalculationInProgressQuery(plantingSiteId ?? 0, {
    skip: plantingSiteId === undefined,
    pollingInterval: isPolling && !import.meta.env.PUBLIC_DISABLE_RECURRENT_REQUESTS ? API_PULL_INTERVAL : undefined,
  });

  const inProgress = currentData?.calculationInProgress ?? false;

  // Keep polling alive only while a recalculation is in progress.
  useEffect(() => {
    setIsPolling(inProgress);
  }, [inProgress]);

  // Refresh this site's observation results once, on the in-progress -> done transition.
  const wasInProgress = useRef(false);
  useEffect(() => {
    if (wasInProgress.current && !inProgress && plantingSiteId !== undefined) {
      dispatch(baseApi.util.invalidateTags([{ type: QueryTagTypes.PlantingSiteSurvivalRate, id: plantingSiteId }]));
    }
    wasInProgress.current = inProgress;
  }, [inProgress, dispatch, plantingSiteId]);

  return { inProgress };
};

export default useSurvivalRateCalculationInProgress;
