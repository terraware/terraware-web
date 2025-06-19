import { useCallback, useEffect, useMemo, useState } from 'react';

import { StatusT } from 'src/redux/features/asyncUtils';
import { selectPlantingSiteValidate } from 'src/redux/features/plantingSite/plantingSiteSelectors';
import { validatePlantingSite } from 'src/redux/features/plantingSite/plantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { CreatePlantingSiteRequestPayload, ValidatePlantingSiteResponsePayload } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  validate: (site: CreatePlantingSiteRequestPayload) => void;
  result: StatusT<ValidatePlantingSiteResponsePayload>;
};

/**
 * Hook to validate a planting site draft.
 */
export default function usePlantingSiteValidate(): Response {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectPlantingSiteValidate(requestId));

  const validate = useCallback(
    (site: CreatePlantingSiteRequestPayload) => {
      const dispatched = dispatch(validatePlantingSite(site));
      setRequestId(dispatched.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (result) {
      if (result.status === 'error') {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    }
  }, [result, snackbar]);

  return useMemo<Response>(
    () => ({
      validate,
      result,
    }),
    [validate, result]
  );
}
