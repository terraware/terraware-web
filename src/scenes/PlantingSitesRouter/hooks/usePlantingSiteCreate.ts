import { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { Statuses } from 'src/redux/features/asyncUtils';

export type Response = {
  createPlantingSite: (draft: DraftPlantingSite) => void;
  createPlantingSiteStatus?: Statuses;
};

/**
 * Hook to create a planting site from a draft.
 * Deletes draft if create is successful.
 * Redirects user to created planting site.
 * Returns create function and status on request.
 */
export default function usePlantingSiteCreate(): Response {
  const history = useHistory();
  const [status, setStatus] = useState<Statuses>();

  const createPlantingSite = useCallback(
    (request: DraftPlantingSite) => {
      // TODO update with dispatch when ready
      if (request) {
        setStatus('pending');
        // timeout is temporarily to mock an in-flight network request
        setTimeout(() => {
          history.push(APP_PATHS.PLANTING_SITES);
        }, 100);
      }
    },
    [history]
  );

  // TODO: add dispatch/selector/error-handling for create when BE API is ready

  return useMemo<Response>(
    () => ({
      createPlantingSite,
      createPlantingSiteStatus: status,
    }),
    [createPlantingSite, status]
  );
}
