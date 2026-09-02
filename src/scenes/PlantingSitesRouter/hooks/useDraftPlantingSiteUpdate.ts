import { useCallback, useMemo, useState } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useUpdateDraftPlantingSiteMutation } from 'src/queries/generated/draftPlantingSites';
import { useValidatePlantingSiteMutation } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { DraftPlantingSite, OptionalSiteEditStep, SiteEditStep } from 'src/types/PlantingSite';
import { fromDraft, fromDraftToCreate } from 'src/utils/draftPlantingSiteUtils';
import useSnackbar from 'src/utils/useSnackbar';

/**
 * Data type for request and response in hook functions.
 * Also is a container to pass state data back to client.
 * @param draft
 * The draft planting site to be created
 * @param nextStep
 * Next step to use in the flow if update was successful.
 * @param optionalSteps
 * Dictionary of optional steps that were completed if update was successful.
 */
type Data = {
  draft: DraftPlantingSite;
  nextStep: SiteEditStep;
  optionalSteps?: Record<OptionalSiteEditStep, boolean>;
};

export type Response = {
  isUpdating: boolean;
  onFinishUpdate: () => void;
  updateDraft: (draft: Data, redirectToDraft: boolean) => void;
  updatedDraft?: Data;
};

/**
 * Hook to isolate workflow logic to update a draft planting site.
 * Returns update function, whether the request is in flight and the updated draft site.
 * Optionally redirects to draft after update.
 */
export default function useDraftPlantingSiteUpdate(): Response {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const [updatedDraft, setUpdatedDraft] = useState<Data | undefined>();

  const [validatePlantingSite, { isLoading: isValidating }] = useValidatePlantingSiteMutation();
  const [updateDraftPlantingSite, { isLoading: isSaving }] = useUpdateDraftPlantingSiteMutation();

  const updateDraft = useCallback(
    (request: Data, redirectToDraft: boolean) => {
      const update = async () => {
        try {
          // a draft is allowed to still have validation problems, so only the request has to succeed
          await validatePlantingSite(fromDraftToCreate(request.draft)).unwrap();

          await updateDraftPlantingSite({
            id: request.draft.id,
            updateDraftPlantingSiteRequestPayload: fromDraft(request.draft),
          }).unwrap();

          if (redirectToDraft) {
            snackbar.toastSuccess(strings.PLANTING_SITE_SAVED);
            navigate(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', `${request.draft.id}`));
          } else {
            setUpdatedDraft(request);
          }
        } catch {
          snackbar.toastError(strings.GENERIC_ERROR);
        }
      };

      void update();
    },
    [navigate, snackbar, updateDraftPlantingSite, validatePlantingSite]
  );

  const onFinishUpdate = useCallback(() => setUpdatedDraft(undefined), []);

  return useMemo<Response>(
    () => ({
      isUpdating: isValidating || isSaving,
      onFinishUpdate,
      updateDraft,
      updatedDraft,
    }),
    [isSaving, isValidating, onFinishUpdate, updateDraft, updatedDraft]
  );
}
