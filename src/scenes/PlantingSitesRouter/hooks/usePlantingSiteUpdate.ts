import { useCallback, useMemo, useState } from 'react';

import { StatusT } from 'src/redux/features/asyncUtils';
import { selectPlantingSiteUpdate } from 'src/redux/features/plantingSite/plantingSiteSelectors';
import { updatePlantingSite } from 'src/redux/features/plantingSite/plantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { PlantingSitePutRequestBody } from 'src/services/TrackingService';

export type Response = {
  update: (id: number, request: PlantingSitePutRequestBody) => void;
  result: StatusT<boolean>;
};

/**
 * Hook to update a planting site
 */
export default function usePlantingSiteUpdate(): Response {
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectPlantingSiteUpdate(requestId));

  const update = useCallback(
    (id: number, plantingSite: PlantingSitePutRequestBody) => {
      const dispatched = dispatch(updatePlantingSite({ id, plantingSite }));
      setRequestId(dispatched.requestId);
    },
    [dispatch]
  );

  return useMemo<Response>(
    () => ({
      update,
      result,
    }),
    [update, result]
  );
}
