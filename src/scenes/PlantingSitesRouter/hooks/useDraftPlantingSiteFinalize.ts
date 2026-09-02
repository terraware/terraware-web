import { useCallback, useMemo } from 'react';

import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useDeleteDraftPlantingSiteMutation } from 'src/queries/generated/draftPlantingSites';
import { useCreatePlantingSiteMutation, useValidatePlantingSiteMutation } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { DraftPlantingSite, PlantingSiteProblem } from 'src/types/PlantingSite';
import { fromDraftToCreate } from 'src/utils/draftPlantingSiteUtils';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  finalize: (draft: DraftPlantingSite) => void;
  isPending: boolean;
};

/**
 * Hook to create a planting site from a draft.
 * Deletes draft if create is successful.
 * Redirects user to created planting site.
 * Returns create function and whether a request is in flight.
 */
export default function useDraftPlantingSiteFinalize(
  onSuccess?: (plantingSiteId: number) => void,
  onError?: (problems?: PlantingSiteProblem[]) => void
): Response {
  const snackbar = useSnackbar();
  const trackEvent = useTrackEvent();

  const [validatePlantingSite, { isLoading: isValidating }] = useValidatePlantingSiteMutation();
  const [createPlantingSite, { isLoading: isCreating }] = useCreatePlantingSiteMutation();
  const [deleteDraftPlantingSite, { isLoading: isDeleting }] = useDeleteDraftPlantingSiteMutation();

  const finalize = useCallback(
    (draft: DraftPlantingSite) => {
      const createFromDraft = async () => {
        const site = fromDraftToCreate(draft);

        try {
          const validation = await validatePlantingSite(site).unwrap();

          if (!validation.isValid) {
            onError?.(validation.problems);
            return;
          }

          const { id } = await createPlantingSite(site).unwrap();

          trackEvent(MIXPANEL_EVENTS.PLANTING_SITE_CREATED, {
            num_strata: draft.strata?.length,
            has_boundary: draft.boundary !== undefined && draft.boundary !== null,
          });

          // the site exists at this point, so a failed draft cleanup must not read as a failed create
          await deleteDraftPlantingSite(draft.id)
            .unwrap()
            .catch(() => undefined);

          onSuccess?.(id);
        } catch {
          snackbar.toastError(strings.GENERIC_ERROR);
        }
      };

      void createFromDraft();
    },
    [createPlantingSite, deleteDraftPlantingSite, onError, onSuccess, snackbar, trackEvent, validatePlantingSite]
  );

  return useMemo<Response>(
    () => ({
      finalize,
      isPending: isValidating || isCreating || isDeleting,
    }),
    [finalize, isCreating, isDeleting, isValidating]
  );
}
