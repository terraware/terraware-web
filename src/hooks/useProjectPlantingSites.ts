import { useCallback, useEffect, useMemo, useState } from 'react';

import { selectProjectPlantingSiteList } from 'src/redux/features/tracking/trackingSelectors';
import { requestListProjectPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

export const useProjectPlantingSites = (projectId: number) => {
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState<string>('');

  const result = useAppSelector(selectProjectPlantingSiteList(requestId));

  const reload = useCallback(() => {
    const request = dispatch(requestListProjectPlantingSites(projectId));
    setRequestId(request.requestId);
  }, [dispatch, projectId]);

  useEffect(() => {
    reload();
  }, [dispatch, reload]);

  const plantingSites = useMemo(
    () => (result?.status === 'success' && result.data ? result.data : undefined),
    [result]
  );

  return { plantingSites, reload };
};
