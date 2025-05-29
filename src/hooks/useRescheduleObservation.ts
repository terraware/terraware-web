import { useCallback, useMemo, useState } from 'react';

import { requestRescheduleObservation } from 'src/redux/features/observations/observationsAsyncThunks';
import { selectRescheduleObservation } from 'src/redux/features/observations/observationsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

const useRescheduleObservation = () => {
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState('');
  const rescheduleResult = useAppSelector(selectRescheduleObservation(requestId));

  const reschedule = useCallback(
    (observationId: number, startDate: string, endDate: string) => {
      const request = dispatch(
        requestRescheduleObservation({
          observationId,
          request: { startDate, endDate },
        })
      );

      setRequestId(request.requestId);
    },
    [dispatch]
  );

  return useMemo(
    () => ({
      reschedule,
      rescheduleResult,
    }),
    [reschedule, rescheduleResult]
  );
};

export default useRescheduleObservation;
