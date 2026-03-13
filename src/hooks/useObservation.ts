import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  selectOneObservation,
  selectOneObservationResults,
} from 'src/redux/features/observations/observationsSelectors';
import { requestOneObservation, requestOneObservationResult } from 'src/redux/features/observations/observationsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

const useObservation = (observationId?: number) => {
  const dispatch = useAppDispatch();

  const [observationRequestId, setObservationRequestId] = useState('');
  const [observationResultsRequestId, setObservationResultsRequestId] = useState('');

  const observationResponse = useAppSelector(selectOneObservation(observationRequestId));
  const observationResultsResponse = useAppSelector(selectOneObservationResults(observationResultsRequestId));

  const reload = useCallback(() => {
    if (observationId !== undefined) {
      const observationRequest = dispatch(requestOneObservation({ observationId }));
      const observationResultRequest = dispatch(requestOneObservationResult({ observationId, includePlants: true }));
      setObservationRequestId(observationRequest.requestId);
      setObservationResultsRequestId(observationResultRequest.requestId);
    }
  }, [dispatch, observationId]);

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
