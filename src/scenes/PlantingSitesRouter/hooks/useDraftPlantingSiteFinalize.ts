import { useCallback, useEffect, useMemo, useState } from 'react';

import { selectDraftPlantingSiteEdit } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { requestDeleteDraft } from 'src/redux/features/draftPlantingSite/draftPlantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DraftPlantingSite, PlantingSiteProblem } from 'src/types/PlantingSite';
import { fromDraftToCreate } from 'src/utils/draftPlantingSiteUtils';
import useSnackbar from 'src/utils/useSnackbar';

import usePlantingSiteCreate from './usePlantingSiteCreate';
import usePlantingSiteValidate from './usePlantingSiteValidate';

export type Response = {
  finalize: (draft: DraftPlantingSite) => void;
  isPending: boolean;
};

/**
 * Hook to create a planting site from a draft.
 * Deletes draft if create is successful.
 * Redirects user to created planting site.
 * Returns create function and status on request.
 */
export default function useDraftPlantingSiteFinalize(
  onSuccess?: (plantingSiteId: number) => void,
  onError?: (problems?: PlantingSiteProblem[]) => void
): Response {
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState<DraftPlantingSite>();
  const snackbar = useSnackbar();

  const { create, result: createResult } = usePlantingSiteCreate();

  const { validate, result: validateResult } = usePlantingSiteValidate();
  const [deleteDraftRequestId, setDeleteDraftRequestId] = useState<string>('');
  const deleteDraftResult = useAppSelector(selectDraftPlantingSiteEdit(deleteDraftRequestId));

  const _createFromDraft = useCallback(
    (_draft: DraftPlantingSite) => {
      const site = fromDraftToCreate(_draft);
      create(site);
    },
    [create]
  );

  const _validateDraft = useCallback(
    (_draft: DraftPlantingSite) => {
      const site = fromDraftToCreate(_draft);
      validate(site);
    },
    [validate]
  );

  const _deleteDraft = useCallback(
    (_draft: DraftPlantingSite) => {
      const dispatched = dispatch(requestDeleteDraft(_draft.id));
      setDeleteDraftRequestId(dispatched.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (validateResult) {
      if (validateResult.status === 'error') {
        snackbar.toastError(strings.GENERIC_ERROR);
      } else if (validateResult.status === 'success') {
        if (validateResult.data?.isValid) {
          if (draft) {
            _createFromDraft(draft);
          }
        } else {
          onError?.(validateResult.data?.problems);
        }
      }
    }
  }, [_createFromDraft, draft, onError, snackbar, validateResult]);

  useEffect(() => {
    if (createResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (createResult?.status === 'success') {
      if (draft) {
        _deleteDraft(draft);
      }
    }
  }, [_createFromDraft, draft, onError, createResult, _deleteDraft, snackbar]);

  useEffect(() => {
    if (deleteDraftResult?.status === 'success') {
      if (createResult?.data) {
        onSuccess?.(createResult.data);
      }
    }
  }, [deleteDraftResult, createResult, dispatch, onSuccess]);

  const finalize = useCallback(
    (_draft: DraftPlantingSite) => {
      setDraft(_draft);
      _validateDraft(_draft);
    },
    [_validateDraft]
  );

  const isPending = useMemo(() => {
    return (
      validateResult?.status === 'pending' ||
      createResult?.status === 'pending' ||
      deleteDraftResult?.status === 'pending'
    );
  }, [createResult?.status, deleteDraftResult?.status, validateResult?.status]);

  return useMemo<Response>(
    () => ({
      finalize,
      isPending,
    }),
    [finalize, isPending]
  );
}
