import { useCallback, useEffect, useMemo } from 'react';

import { useLocalization } from 'src/providers';
import { AcceleratorProject } from 'src/types/AcceleratorProject';
import useSnackbar from 'src/utils/useSnackbar';

import { useLazyListProjectAcceleratorDetailsQuery } from '../queries/generated/acceleratorProjects';

export type UseAcceleratorProjectsResult = {
  isLoading: boolean;
  acceleratorProjects: AcceleratorProject[];
  refetch: () => void;
};

export const useAcceleratorProjects = (): UseAcceleratorProjectsResult => {
  const { activeLocale, strings } = useLocalization();
  const snackbar = useSnackbar();

  const [listProjectAcceleratorDetails, listDetailsResponse] = useLazyListProjectAcceleratorDetailsQuery();

  const fetchAcceleratorProjects = useCallback(
    (preferCached: boolean = false) => {
      if (!activeLocale) {
        return;
      }

      void listProjectAcceleratorDetails(undefined, preferCached);
    },
    [activeLocale, listProjectAcceleratorDetails]
  );

  useEffect(() => {
    fetchAcceleratorProjects(true);
  }, [fetchAcceleratorProjects]);

  const acceleratorProjects = useMemo(
    () => (listDetailsResponse.isSuccess ? listDetailsResponse.data.details : []),
    [listDetailsResponse]
  );

  useEffect(() => {
    if (listDetailsResponse.isError) {
      const errorMessage = strings.GENERIC_ERROR;
      snackbar.toastError(errorMessage);
    }
  }, [listDetailsResponse.isError, snackbar, strings]);

  return {
    isLoading: listDetailsResponse.isLoading,
    acceleratorProjects,
    refetch: fetchAcceleratorProjects,
  };
};
