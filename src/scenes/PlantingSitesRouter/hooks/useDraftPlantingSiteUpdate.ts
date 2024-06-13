import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { Statuses } from 'src/redux/features/asyncUtils';
import { selectDraftPlantingSiteEdit } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { requestUpdateDraft } from 'src/redux/features/draftPlantingSite/draftPlantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DraftPlantingSite, OptionalSiteEditStep, SiteEditStep } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';

import usePlantingSiteValidate from './usePlantingSiteValidate';

/**
 * Data type for request and response in hook functions.
 * Also is a container to pass state data back to client.
 * @param draft
 *  The draft planting site to be created
 * @param nextStep
 *  Next step to use in the flow if update was successful.
 * @param optionalSteps
 *  Dictionary of optional steps that were completed if update was successful.
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
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [draftRequest, setDraftRequest] = useState<Data>();
  const [updatedDraft, setUpdatedDraft] = useState<Data | undefined>();
  const [redirect, setRedirect] = useState<boolean>(false);

  const [requestId, setRequestId] = useState<string>('');
  const draftResult = useAppSelector(selectDraftPlantingSiteEdit(requestId));

  const { validateDraft, validateSite, validateSiteStatus, isValid, problems } = usePlantingSiteValidate();

  const _validateDraft = useCallback(
    (request: Data) => {
      validateSite(request.draft);
    },
    [validateSite]
  );

  const _updateDraft = useCallback(
    (request: Data) => {
      const dispatched = dispatch(requestUpdateDraft(request.draft));
      setRequestId(dispatched.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (draftRequest && validateDraft === draftRequest.draft) {
      if (validateSiteStatus === 'success') {
        if (isValid) {
          _updateDraft(draftRequest);
        } else {
          // TODO: Show detailed erros on map according to designs
          snackbar.toastError('Failed to validate planting site.');
          // TODO: Remove debug logs
          console.log('Server responded with problems during validation: ', problems);
        }
      } else if (validateSiteStatus === 'error') {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    }
  }, [_updateDraft, draftRequest, validateDraft, validateSiteStatus, isValid]);

  useEffect(() => {
    if (draftResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [draftResult?.status, snackbar]);

  useEffect(() => {
    if (draftResult?.status === 'success' && draftRequest) {
      if (redirect) {
        snackbar.toastSuccess(strings.PLANTING_SITE_SAVED);
        navigate(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', `${draftRequest.draft.id}`));
      } else {
        setUpdatedDraft(draftRequest);
      }
    }
  }, [draftRequest, draftResult?.status, navigate, redirect, snackbar]);

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
    [problems, validateDraft, validateSiteStatus, updateDraft, updatedDraft, draftResult?.status]
  );
}
