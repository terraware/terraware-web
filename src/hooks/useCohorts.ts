import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';
import { requestCohorts } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohortsRequest } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Cohort } from 'src/types/Cohort';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  availableCohorts?: Cohort[];
  fetch: () => void;
  selectedCohort?: Cohort;
};

export const useCohorts = (cohortId?: number): Response => {
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [availableCohorts, setAvailableCohorts] = useState<Cohort[] | undefined>();
  const [selectedCohort, setSelectedCohort] = useState<Cohort | undefined>();
  const result = useAppSelector(selectCohortsRequest);

  useEffect(() => {
    if (availableCohorts && cohortId) {
      setSelectedCohort(availableCohorts.find((cohort) => cohort.id === cohortId));
    } else {
      setSelectedCohort(undefined);
    }
  }, [availableCohorts, cohortId]);

  useEffect(() => {
    if (result.cohorts) {
      setAvailableCohorts(result.cohorts);
    } else if (result.error) {
      snackbar.toastError();
    }
  }, [result, snackbar]);

  const fetch = useCallback(() => {
    dispatch(requestCohorts({ locale: activeLocale }));
  }, [activeLocale, dispatch]);

  useEffect(() => {
    if (!availableCohorts) {
      fetch();
    }
  }, [availableCohorts, fetch]);

  return useMemo<Response>(
    () => ({
      availableCohorts,
      fetch,
      selectedCohort,
    }),
    [availableCohorts, fetch, selectedCohort]
  );
};
