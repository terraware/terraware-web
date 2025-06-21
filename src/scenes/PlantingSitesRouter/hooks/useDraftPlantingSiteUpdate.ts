import { useCallback, useEffect, useMemo, useState } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { Statuses } from 'src/redux/features/asyncUtils';
import { selectDraftPlantingSiteEdit } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { requestUpdateDraft } from 'src/redux/features/draftPlantingSite/draftPlantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DraftPlantingSite, OptionalSiteEditStep, SiteEditStep } from 'src/types/PlantingSite';
import { fromDraftToCreate } from 'src/utils/draftPlantingSiteUtils';
import useSnackbar from 'src/utils/useSnackbar';

import usePlantingSiteValidate from './usePlantingSiteValidate';

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
export type Data = {
  draft: DraftPlantingSite;
  nextStep: SiteEditStep;
  optionalSteps?: Record<OptionalSiteEditStep, boolean>;
};

export type Response = {
  onFinishUpdate: () => void;
  updateDraft: (draft: Data, redirectToDraft: boolean) => void;
  updateDraftStatus?: Statuses;
  updatedDraft?: Data;
};

/**
 * Hook to isoloate workflow logic to update a draft planting site.
 * Returns update function, status on request and the updated draft site.
 * Optionally redirects to draft after update.
 */
export default function useDraftPlantingSiteUpdate(): Response {
  const dispatch = useAppDispatch();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const [draftRequest, setDraftRequest] = useState<Data>();
  const [updatedDraft, setUpdatedDraft] = useState<Data | undefined>();
  const [redirect, setRedirect] = useState<boolean>(false);

  const [requestId, setRequestId] = useState<string>('');
  const draftResult = useAppSelector(selectDraftPlantingSiteEdit(requestId));

  const { validate, result: validateResult } = usePlantingSiteValidate();

  const _updateDraft = useCallback(
    (request: Data) => {
      const dispatched = dispatch(requestUpdateDraft(request.draft));
      setRequestId(dispatched.requestId);
    },
    [dispatch]
  );

  const _validateDraft = useCallback(
    (request: Data) => {
      const site = fromDraftToCreate(request.draft);
      validate(site);
    },
    [validate]
  );

  useEffect(() => {
    if (validateResult?.status === 'success' && draftRequest) {
      _updateDraft(draftRequest);
    }
  }, [draftRequest, _updateDraft, validateResult]);

  useEffect(() => {
    if (draftResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [draftResult?.status, snackbar]);

  useEffect(() => {
    if (draftResult) {
      if (draftResult.status === 'error') {
        snackbar.toastError(strings.GENERIC_ERROR);
      } else if (draftResult?.status === 'success' && draftRequest) {
        if (redirect) {
          snackbar.toastSuccess(strings.PLANTING_SITE_SAVED);
          navigate(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', `${draftRequest.draft.id}`));
        } else {
          setUpdatedDraft(draftRequest);
        }
      }
    }
  }, [draftRequest, draftResult, navigate, redirect, snackbar]);

  const updateDraft = useCallback(
    (request: Data, redirectToDraft: boolean) => {
      setDraftRequest(request);
      setRedirect(redirectToDraft);
      _validateDraft(request);
    },
    [_validateDraft]
  );

  return useMemo<Response>(
    () => ({
      onFinishUpdate: () => {
        setUpdatedDraft(undefined);
        setRequestId('');
      },
      updateDraft,
      updateDraftStatus: draftResult?.status,
      updatedDraft,
    }),
    [updateDraft, updatedDraft, draftResult?.status]
  );
}
