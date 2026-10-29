import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  useGetDraftPlantingSiteQuery,
  useUpdateDraftPlantingSiteMutation,
} from 'src/queries/generated/draftPlantingSites';
import { useValidatePlantingSiteMutation } from 'src/queries/generated/plantingSites';
import { withDefaultStrata } from 'src/scenes/PlantingSitesRouter/edit/editor/utils';
import strings from 'src/strings';
import { DraftPlantingSite, OptionalSiteEditStep, PlantingSiteProblem, SiteEditStep } from 'src/types/PlantingSite';
import {
  fromDraft,
  fromDraftToCreate,
  getDraftMapProblems,
  getDraftSaveErrorMessage,
  toDraft,
} from 'src/utils/draftPlantingSiteUtils';
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

type PendingSave = {
  problems: PlantingSiteProblem[];
  request: Data;
};

export type Response = {
  isUpdating: boolean;
  onCancelSave: () => void;
  onFinishUpdate: () => void;
  onSaveAnyway: () => void;
  problems?: PlantingSiteProblem[];
  updateDraft: (draft: Data) => void;
  updatedDraft?: Data;
};

/**
 * Hook to isolate workflow logic to update a draft planting site.
 * Returns update function, whether the request is in flight and the updated draft site.
 * If the draft has validation problems, the save waits for onSaveAnyway or onCancelSave.
 */
export default function useDraftPlantingSiteUpdate(draftId: number): Response {
  const snackbar = useSnackbar();
  const showProblems = usePlantingSiteProblemsToast();

  const [pendingRefetch, setPendingRefetch] = useState<PendingRefetch | undefined>();
  const [pendingSave, setPendingSave] = useState<PendingSave | undefined>();

  const [validatePlantingSite, { isLoading: isValidating }] = useValidatePlantingSiteMutation();
  const [updateDraftPlantingSite, { isLoading: isSaving }] = useUpdateDraftPlantingSiteMutation();
  const { currentData, isError, isFetching, requestId } = useGetDraftPlantingSiteQuery(draftId);

  const latestRequestId = useRef(requestId);
  useEffect(() => {
    latestRequestId.current = requestId;
  }, [requestId]);

  const save = useCallback(
    async (request: Data) => {
      try {
        const requestIdBeforeSave = latestRequestId.current;

        await updateDraftPlantingSite({
          id: request.draft.id,
          updateDraftPlantingSiteRequestPayload: fromDraft(
            request.draft,
            currentData ? toDraft(currentData.site) : undefined
          ),
        }).unwrap();

        snackbar.toastInfo(strings.PLANTING_SITE_SAVED_AS_DRAFT);
        setPendingRefetch({ request, requestIdBeforeSave });
      } catch (error) {
        const problems = getDraftMapProblems(error);
        if (problems?.length) {
          showProblems(problems);
        } else {
          snackbar.toastError(getDraftSaveErrorMessage(error));
        }
      }
    },
    [currentData, showProblems, snackbar, updateDraftPlantingSite]
  );

  const updateDraft = useCallback(
    (request: Data) => {
      const update = async () => {
        let problems: PlantingSiteProblem[];
        try {
          ({ problems } = await validatePlantingSite(fromDraftToCreate(withDefaultStrata(request.draft))).unwrap());
        } catch (error) {
          snackbar.toastError(getDraftSaveErrorMessage(error));
          return;
        }

        if (problems.length) {
          setPendingSave({ problems, request });
        } else {
          await save(request);
        }
      };

      void update();
    },
    [save, snackbar, validatePlantingSite]
  );

  const onSaveAnyway = useCallback(() => {
    if (pendingSave) {
      setPendingSave(undefined);
      void save(pendingSave.request);
    }
  }, [pendingSave, save]);

  const onCancelSave = useCallback(() => setPendingSave(undefined), []);

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
      onCancelSave,
      onFinishUpdate,
      onSaveAnyway,
      problems: pendingSave?.problems,
      updateDraft,
      updatedDraft,
    }),
    [
      isSaving,
      isValidating,
      onCancelSave,
      onFinishUpdate,
      onSaveAnyway,
      pendingRefetch,
      pendingSave,
      updateDraft,
      updatedDraft,
    ]
  );
}
