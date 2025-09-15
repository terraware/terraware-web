import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  selectOneObservaiton,
  selectOneObservaitonResults,
} from 'src/redux/features/observations/observationsSelectors';
import { requestOneObservation, requestOneObservationResult } from 'src/redux/features/observations/observationsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Observation, ObservationResultsPayload } from 'src/types/Observations';

const useObservation = (observationId?: number) => {
  const dispatch = useAppDispatch();

  const [observation, setObservation] = useState<Observation>();
  const [observationResults, setObservationResults] = useState<ObservationResultsPayload>();

  const [observationRequestId, setObservationRequestId] = useState('');
  const [observationResultsRequestId, setObservationResultsRequestId] = useState('');

  const observationResponse = useAppSelector(selectOneObservaiton(observationRequestId));
  const observationResultsResponse = useAppSelector(selectOneObservaitonResults(observationResultsRequestId));

  const reload = useCallback(() => {
    if (observationId !== undefined) {
      const observationRequest = dispatch(requestOneObservation({ observationId }));
      const observationResultRequest = dispatch(requestOneObservationResult({ observationId, includePlants: true }));
      setObservationRequestId(observationRequest.requestId);
      setObservationResultsRequestId(observationResultRequest.requestId);
    }
  }, [dispatch, observationId]);

  useEffect(() => {
    if (observationResponse) {
      if (observationResponse.status === 'success' && observationResponse.data) {
        setObservation(observationResponse.data);
      }
    }
  }, [observationResponse]);

  useEffect(() => {
    if (observationResultsResponse) {
      if (observationResultsResponse.status === 'success' && observationResultsResponse.data) {
        setObservationResults(observationResultsResponse.data);
      }
    }
  }, [observationResultsResponse]);

  useEffect(() => {
    reload();
  }, [reload]);

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
