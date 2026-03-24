import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  selectOneObservation,
  selectOneObservationResults,
} from 'src/redux/features/observations/observationsSelectors';
import { requestOneObservation, requestOneObservationResult } from 'src/redux/features/observations/observationsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

type UseObservationOptions = {
  skipObservation?: boolean;
};

const useObservation = (observationId?: number, options?: UseObservationOptions) => {
  const dispatch = useAppDispatch();
  const { skipObservation } = options ?? {};

  const [observationRequestId, setObservationRequestId] = useState('');
  const [observationResultsRequestId, setObservationResultsRequestId] = useState('');

  const observationResponse = useAppSelector(selectOneObservation(observationRequestId));
  const observationResultsResponse = useAppSelector(selectOneObservationResults(observationResultsRequestId));

  const reload = useCallback(() => {
    if (observationId !== undefined) {
      if (!skipObservation) {
        const observationRequest = dispatch(requestOneObservation({ observationId }));
        setObservationRequestId(observationRequest.requestId);
      }
      const observationResultRequest = dispatch(requestOneObservationResult({ observationId, includePlants: true }));
      setObservationResultsRequestId(observationResultRequest.requestId);
    }
  }, [dispatch, observationId, skipObservation]);

  useEffect(() => {
    reload();
  }, [reload]);

  const observation = useMemo(
    () =>
      observationResponse?.status === 'success' && observationResponse.data ? observationResponse.data : undefined,
    [observationResponse]
  );

  const observationResults = useMemo(
    () =>
      observationResultsResponse?.status === 'success' && observationResultsResponse.data
        ? observationResultsResponse.data
        : undefined,
    [observationResultsResponse]
  );

  return useMemo(
    () => ({
      reload,
      observation,
      observationResults,
    }),
    [observation, observationResults, reload]
  );
};

export default useObservation;
