import { useCallback, useEffect, useState } from 'react';

import { selectProjectPlantingSiteList } from 'src/redux/features/tracking/trackingSelectors';
import { requestListProjectPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { PlantingSite } from 'src/types/Tracking';

export const useProjectPlantingSites = (projectId: number) => {
  const dispatch = useAppDispatch();

  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const [requestId, setRequestId] = useState<string>('');

  const result = useAppSelector(selectProjectPlantingSiteList(requestId));

  const reload = useCallback(() => {
    const request = dispatch(requestListProjectPlantingSites(projectId));
    setRequestId(request.requestId);
  }, [dispatch, projectId]);

  useEffect(() => {
    reload();
  }, [dispatch, reload]);

  useEffect(() => {
    if (result && result.status === 'success' && result.data) {
      setPlantingSites(result.data);
    }
  }, [result]);

  return { plantingSites, reload };
};
