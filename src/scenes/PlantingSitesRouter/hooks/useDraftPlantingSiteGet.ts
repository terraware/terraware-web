import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { Statuses } from 'src/redux/features/asyncUtils';
import { selectDraftPlantingSiteGet } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { requestGetDraft } from 'src/redux/features/draftPlantingSite/draftPlantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';

export type Props = {
  draftId: number;
};

export type Response = {
  status: Statuses;
  site?: DraftPlantingSite;
};

/**
 * Hook to fetch a draft planting site.
 * Returns status on request and the fetched draft site.
 */
export default function useDraftPlantingSiteGet({ draftId }: Props): Response {
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const draftResult = useAppSelector(selectDraftPlantingSiteGet(draftId));

  const goToPlantingSites = useCallback(() => {
    navigate(APP_PATHS.PLANTING_SITES);
  }, [navigate]);

  useEffect(() => {
    if (!isNaN(draftId)) {
      dispatch(requestGetDraft(draftId));
    } else {
      goToPlantingSites();
    }
  }, [dispatch, draftId, goToPlantingSites]);

  useEffect(() => {
    if (draftResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
      goToPlantingSites();
    }
  }, [draftResult?.status, goToPlantingSites, snackbar]);

  return useMemo<Response>(
    () => ({
      status: draftResult?.status ?? 'pending',
      site: draftResult?.data,
    }),
    [draftResult]
  );
}
