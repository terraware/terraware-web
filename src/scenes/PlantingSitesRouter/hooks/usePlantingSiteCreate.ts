import { useCallback, useEffect, useMemo, useState } from 'react';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { Statuses } from 'src/redux/features/asyncUtils';
import { selectDraftPlantingSiteEdit } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { requestDeleteDraft } from 'src/redux/features/draftPlantingSite/draftPlantingSiteThunks';
import { selectPlantingSiteCreate } from 'src/redux/features/plantingSite/plantingSiteSelectors';
import { createPlantingSite } from 'src/redux/features/plantingSite/plantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';

import usePlantingSiteValidate from './usePlantingSiteValidate';

export type Response = {
  createPlantingSite: (draft: DraftPlantingSite) => void;
  createPlantingSiteStatus?: Statuses;
  createPlantingSiteId?: number;
};

/**
 * Hook to create a planting site from a draft.
 * Deletes draft if create is successful.
 * Redirects user to created planting site.
 * Returns create function and status on request.
 */
export default function usePlantingSiteCreate(): Response {
  const dispatch = useAppDispatch();
  const { goToPlantingSiteView } = useNavigateTo();
  const snackbar = useSnackbar();

  const [createRequest, setCreateRequest] = useState<DraftPlantingSite>();
  const [requestId, setRequestId] = useState<string>('');
  const createResult = useAppSelector(selectPlantingSiteCreate(requestId));

  const [deleteDraftRequestId, setDeleteDraftRequestId] = useState<string>('');
  const deleteDraftResult = useAppSelector(selectDraftPlantingSiteEdit(deleteDraftRequestId));

  const { validateDraft, validateSite, validateSiteStatus, isValid, problems } = usePlantingSiteValidate();

  const _validateDraft = useCallback(
    (draft: DraftPlantingSite) => {
      validateSite(draft);
    },
    [validateSite]
  );

  const _createSite = useCallback(
    (draft: DraftPlantingSite) => {
      const dispatched = dispatch(createPlantingSite(draft));
      setCreateRequest(draft);
      setRequestId(dispatched.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (createRequest && validateDraft === createRequest) {
      if (validateSiteStatus === 'success') {
        if (isValid) {
          _createSite(createRequest);
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
  }, [_createSite, createRequest, validateDraft, validateSiteStatus, isValid]);

  const createSite = useCallback(
    (draft: DraftPlantingSite) => {
      setCreateRequest(draft);
      _validateDraft(draft);
    },
    [_validateDraft]
  );

  useEffect(() => {
    if (createResult?.status === 'error' || deleteDraftResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [createResult?.status, deleteDraftResult?.status, snackbar]);

  useEffect(() => {
    if (createResult?.status === 'success' && createRequest) {
      const dispatched = dispatch(requestDeleteDraft(createRequest.id));
      setDeleteDraftRequestId(dispatched.requestId);
    }
  }, [createRequest, createResult?.status, dispatch]);

  useEffect(() => {
    if (deleteDraftResult?.status === 'success' && createResult.data) {
      snackbar.toastSuccess(strings.PLANTING_SITE_SAVED);
      goToPlantingSiteView(createResult.data);
    }
  }, [deleteDraftResult, createResult, dispatch, goToPlantingSiteView, snackbar]);

  return useMemo<Response>(
    () => ({
      createPlantingSite: createSite,
      createPlantingSiteStatus: createResult?.status,
      createPlantingSiteId: createResult?.data,
    }),
    [createSite, createResult]
  );
}
