import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import {
  useGetDraftPlantingSiteQuery,
  useUpdateDraftPlantingSiteMutation,
} from 'src/queries/generated/draftPlantingSites';
import { useValidatePlantingSiteMutation } from 'src/queries/generated/plantingSites';
import { withDefaultStrata } from 'src/scenes/PlantingSitesRouter/edit/editor/utils';
import strings from 'src/strings';
import { DraftPlantingSite, OptionalSiteEditStep, SiteEditStep } from 'src/types/PlantingSite';
import { fromDraft, fromDraftToCreate, getDraftMapProblems, toDraft } from 'src/utils/draftPlantingSiteUtils';
import useSnackbar from 'src/utils/useSnackbar';

import usePlantingSiteProblemsToast from './usePlantingSiteProblemsToast';

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

type PendingRefetch = {
  request: Data;
  requestIdBeforeSave?: string;
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
export default function useDraftPlantingSiteUpdate(draftId: number): Response {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const showProblems = usePlantingSiteProblemsToast();

  const [pendingRefetch, setPendingRefetch] = useState<PendingRefetch | undefined>();

  const [validatePlantingSite, { isLoading: isValidating }] = useValidatePlantingSiteMutation();
  const [updateDraftPlantingSite, { isLoading: isSaving }] = useUpdateDraftPlantingSiteMutation();
  const { currentData, isError, isFetching, requestId } = useGetDraftPlantingSiteQuery(draftId);

  const latestRequestId = useRef(requestId);
  useEffect(() => {
    latestRequestId.current = requestId;
  }, [requestId]);

  const updateDraft = useCallback(
    (request: Data, redirectToDraft: boolean) => {
      const update = async () => {
        try {
          // a draft is allowed to still have validation problems, so only the request has to succeed
          await validatePlantingSite(fromDraftToCreate(withDefaultStrata(request.draft))).unwrap();

          const requestIdBeforeSave = latestRequestId.current;

          await updateDraftPlantingSite({
            id: request.draft.id,
            updateDraftPlantingSiteRequestPayload: fromDraft(
              request.draft,
              currentData ? toDraft(currentData.site) : undefined
            ),
          }).unwrap();

          if (redirectToDraft) {
            snackbar.toastSuccess(strings.PLANTING_SITE_SAVED);
            navigate(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', `${request.draft.id}`));
          } else {
            setPendingRefetch({ request, requestIdBeforeSave });
          }
        } catch (error) {
          const problems = getDraftMapProblems(error);
          if (problems?.length) {
            showProblems(problems);
          } else {
            snackbar.toastError(strings.GENERIC_ERROR);
          }
        }
      };

      void update();
    },
    [currentData, navigate, showProblems, snackbar, updateDraftPlantingSite, validatePlantingSite]
  );

  // continue from the copy refetched after saving so new strata carry the IDs the server assigned
  const updatedDraft = useMemo<Data | undefined>(() => {
    if (!pendingRefetch || isFetching || isError || !currentData || requestId === pendingRefetch.requestIdBeforeSave) {
      return undefined;
    }

    return { ...pendingRefetch.request, draft: toDraft(currentData.site) };
  }, [currentData, isError, isFetching, pendingRefetch, requestId]);

  const onFinishUpdate = useCallback(() => setPendingRefetch(undefined), []);

  return useMemo<Response>(
    () => ({
      isUpdating: isValidating || isSaving || (!!pendingRefetch && !updatedDraft),
      onFinishUpdate,
      updateDraft,
      updatedDraft,
    }),
    [isSaving, isValidating, onFinishUpdate, pendingRefetch, updateDraft, updatedDraft]
  );
}
