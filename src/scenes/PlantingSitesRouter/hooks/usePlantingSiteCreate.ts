import { useCallback, useMemo, useState } from 'react';

import { StatusT } from 'src/redux/features/asyncUtils';
import { selectPlantingSiteCreate } from 'src/redux/features/plantingSite/plantingSiteSelectors';
import { createPlantingSite } from 'src/redux/features/plantingSite/plantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { CreatePlantingSiteRequestPayload } from 'src/types/PlantingSite';

export type Response = {
  create: (site: CreatePlantingSiteRequestPayload) => void;
  result: StatusT<number>;
};

/**
 * Hook to create a planting site
 */
export default function usePlantingSiteCreate(): Response {
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectPlantingSiteCreate(requestId));

  const create = useCallback(
    (site: CreatePlantingSiteRequestPayload) => {
      const dispatched = dispatch(createPlantingSite(site));
      setRequestId(dispatched.requestId);
    },
    [dispatch]
  );

  return useMemo<Response>(
    () => ({
      create,
      result,
    }),
    [create, result]
  );
}
