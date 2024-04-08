import { useCallback, useMemo } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import { DraftPlantingSite } from 'src/types/PlantingSite';

// TODO: replace with actual creation
import useDraftPlantingSiteUpdate from './useDraftPlantingSiteUpdate';

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
  // TODO: replace with actual creation
  const { updateDraft, updateDraftStatus } = useDraftPlantingSiteUpdate();

  const createPlantingSite = useCallback(
    (request: DraftPlantingSite) => {
      // TODO update with dispatch when ready
      if (request) {
        // TODO: replace with actual creation
        updateDraft({ draft: request, nextStep: 'details' }, true);
      }
    },
    [updateDraft]
  );

  return useMemo<Response>(
    () => ({
      createPlantingSite,
      createPlantingSiteStatus: updateDraftStatus,
    }),
    [createPlantingSite, updateDraftStatus]
  );
}
