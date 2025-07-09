import { useCallback, useMemo, useState } from 'react';

import { requestAbandonObservation } from 'src/redux/features/observations/observationsAsyncThunks';
import { selectAbandonObservation } from 'src/redux/features/observations/observationsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

const useAbandonObservation = () => {
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState('');
  const abandonResult = useAppSelector(selectAbandonObservation(requestId));

  const abandon = useCallback(
    (observationId: number) => {
      const request = dispatch(
        requestAbandonObservation({
          observationId,
        })
      );

      setRequestId(request.requestId);
    },
    [dispatch]
  );

  return useMemo(
    () => ({
      abandon,
      abandonResult,
    }),
    [abandon, abandonResult]
  );
};

export default useAbandonObservation;
