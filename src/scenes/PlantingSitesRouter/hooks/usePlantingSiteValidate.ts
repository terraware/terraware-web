import { useCallback, useEffect, useMemo, useState } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import { selectPlantingSiteValidate } from 'src/redux/features/plantingSite/plantingSiteSelectors';
import { validatePlantingSite } from 'src/redux/features/plantingSite/plantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DraftPlantingSite, PlantingSiteProblem } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  validateSite: (draft: DraftPlantingSite) => void;
  validateSiteStatus: Statuses;
  isValid?: boolean;
  problems?: PlantingSiteProblem[];
};

/**
 * Hook to validate a planting site draft.
 */
export default function usePlantingSiteValidate(): Response {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState<string>('');
  const validateResult = useAppSelector(selectPlantingSiteValidate(requestId));

  const validateSite = useCallback(
    (draft: DraftPlantingSite) => {
      const dispatched = dispatch(validatePlantingSite(draft));
      setRequestId(dispatched.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (validateResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [validateResult?.status, snackbar]);

  return useMemo<Response>(
    () => ({
      validateSite,
      validateSiteStatus: validateResult?.status,
      isValid: validateResult?.data?.isValid,
      problems: validateResult?.data?.problems,
    }),
    [validateSite, validateResult]
  );
}
