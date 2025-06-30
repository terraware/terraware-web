import { useCallback, useEffect, useMemo, useState } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { Statuses } from 'src/redux/features/asyncUtils';
import { selectDraftPlantingSiteCreate } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { requestCreateDraft } from 'src/redux/features/draftPlantingSite/draftPlantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DraftPlantingSite, SiteEditStep } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';

/**
 * Data type for request and response in hook functions.
 * Also is a container to pass state data back to client.
 * @param draft
 * The draft planting site to be created
 * @param nextStep
 * Next step to use in the flow if create was successful.
 */
export type Data = {
  draft: DraftPlantingSite;
  nextStep: SiteEditStep;
};

export type Response = {
  createDraft: (draft: Data, redirectToDraft: boolean) => void;
  createDraftStatus?: Statuses;
  createdDraft?: Data;
  onFinishCreate: () => void;
};

/**
 * Hook to isolate workflow logic to create a draft planting site.
 * Returns create function, status on request and the created draft site.
 * Optionally redirects to the created draft.
 */
export default function useDraftPlantingSiteCreate(): Response {
  const dispatch = useAppDispatch();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const [createdDraft, setCreatedDraft] = useState<Data | undefined>();
  const [draftRequest, setDraftRequest] = useState<Data>();
  const [redirect, setRedirect] = useState<boolean>(false);

  const [requestId, setRequestId] = useState<string>('');
  const draftResult = useAppSelector(selectDraftPlantingSiteCreate(requestId));

  const createDraft = useCallback(
    (request: Data, redirectToDraft: boolean) => {
      const dispatched = dispatch(requestCreateDraft(request.draft));
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
    if (draftResult?.status === 'success' && draftResult?.data && draftRequest) {
      const id = draftResult.data;
      navigate(APP_PATHS.PLANTING_SITES_DRAFT_EDIT.replace(':plantingSiteId', `${id}`), { replace: true });
      if (redirect) {
        snackbar.toastSuccess(strings.PLANTING_SITE_SAVED);
        navigate(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', `${id}`));
      } else {
        setCreatedDraft({
          ...draftRequest,
          draft: { ...draftRequest.draft, id },
        });
      }
    }
  }, [draftRequest, draftResult?.data, draftResult?.status, navigate, redirect, snackbar]);

  return useMemo<Response>(
    () => ({
      createDraft,
      createDraftStatus: draftResult?.status,
      createdDraft,
      onFinishCreate: () => {
        setCreatedDraft(undefined);
        setRequestId('');
      },
    }),
    [createDraft, createdDraft, draftResult?.status]
  );
}
