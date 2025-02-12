import { useEffect, useState } from 'react';

import { selectPlantingSiteObservationsSummaries } from 'src/redux/features/observations/observationsSelectors';
import { requestGetPlantingSiteObservationsSummaries } from 'src/redux/features/observations/observationsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ObservationSummary } from 'src/types/Observations';

const useObservationSummaries = (plantingSiteId: number) => {
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const [summaries, setSummaries] = useState<ObservationSummary[]>();
  const plantingObservationsSummaryResponse = useAppSelector((state) =>
    selectPlantingSiteObservationsSummaries(state, requestId)
  );

  useEffect(() => {
    if (plantingSiteId >= 0) {
      const request = dispatch(requestGetPlantingSiteObservationsSummaries(plantingSiteId));
      setRequestId(request.requestId);
    }
  }, [plantingSiteId]);

  useEffect(() => {
    if (plantingObservationsSummaryResponse?.status === 'success') {
      setSummaries(plantingObservationsSummaryResponse.data);
    }
  }, [plantingObservationsSummaryResponse]);

  return summaries;
};

export default useObservationSummaries;
