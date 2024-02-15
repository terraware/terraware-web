import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { DraftPlantingSite, SiteEditStep } from 'src/types/PlantingSite';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Statuses } from 'src/redux/features/asyncUtils';
import { selectDraftPlantingSiteEdit } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { requestUpdateDraft } from 'src/redux/features/draftPlantingSite/draftPlantingSiteThunks';
import useSnackbar from 'src/utils/useSnackbar';

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
  optionalSteps?: Record<SiteEditStep, boolean>;
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
  const history = useHistory();
  const snackbar = useSnackbar();

  const [draftRequest, setDraftRequest] = useState<Data>();
  const [updatedDraft, setUpdatedDraft] = useState<Data | undefined>();
  const [redirect, setRedirect] = useState<boolean>(false);

  const [requestId, setRequestId] = useState<string>('');
  const draftResult = useAppSelector(selectDraftPlantingSiteEdit(requestId));

  const updateDraft = useCallback(
    (request: Data, redirectToDraft: boolean) => {
      setUpdatedDraft(undefined);
      const dispatched = dispatch(requestUpdateDraft(request.draft));
      setRequestId(dispatched.requestId);
      setDraftRequest(request);
      setRedirect(redirectToDraft);
    },
    [dispatch]
  );

  useEffect(() => {
    if (draftResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [draftResult?.status, snackbar]);

  useEffect(() => {
    if (draftResult?.status === 'success' && draftRequest) {
      if (redirect) {
        snackbar.toastSuccess(strings.PLANTING_SITE_SAVED);
        history.push(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', `${draftRequest.draft.id}`));
      } else {
        setUpdatedDraft({ ...draftRequest, draft: _.cloneDeep(draftRequest.draft) });
      }
    }
  }, [draftRequest, draftResult?.status, history, redirect, snackbar]);

  return useMemo<Response>(
    () => ({
      onFinishUpdate: () => void setRequestId(''),
      updateDraft,
      updateDraftStatus: draftResult?.status,
      updatedDraft,
    }),
    [updateDraft, updatedDraft, draftResult?.status]
  );
}
