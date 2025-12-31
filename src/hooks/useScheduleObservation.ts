import { useCallback, useMemo, useState } from 'react';

import { requestScheduleObservation } from 'src/redux/features/observations/observationsAsyncThunks';
import { selectScheduleObservation } from 'src/redux/features/observations/observationsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

const useScheduleObservation = () => {
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState('');
  const scheduleResult = useAppSelector(selectScheduleObservation(requestId));

  const schedule = useCallback(
    (plantingSiteId: number, startDate: string, endDate: string, requestedSubzoneIds: number[] | undefined) => {
      if (requestedSubzoneIds === undefined) {
        // this is a temporary solution because the type on the BE payload is optional, until all references no longer
        // use the old name
        throw new Error('requestedSubzoneIds is undefined');
      }
      const request = dispatch(
        requestScheduleObservation({ endDate, plantingSiteId, requestedSubstratumIds: requestedSubzoneIds, startDate })
      );

      setRequestId(request.requestId);
    },
    [dispatch]
  );

  return useMemo(
    () => ({
      schedule,
      scheduleResult,
    }),
    [schedule, scheduleResult]
  );
};

export default useScheduleObservation;
