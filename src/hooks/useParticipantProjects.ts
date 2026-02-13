import { useCallback, useEffect, useMemo } from 'react';

import { useLocalization } from 'src/providers';
import { ParticipantProject } from 'src/types/ParticipantProject';
import useSnackbar from 'src/utils/useSnackbar';

import { useLazyListProjectAcceleratorDetailsQuery } from '../queries/generated/acceleratorProjects';

export type UseParticipantProjectsResult = {
  isLoading: boolean;
  participantProjects: ParticipantProject[];
  refetch: () => void;
};

export const useParticipantProjects = (): UseParticipantProjectsResult => {
  const { activeLocale, strings } = useLocalization();
  const snackbar = useSnackbar();

  const [listProjectAcceleratorDetails, listDetailsResponse] = useLazyListProjectAcceleratorDetailsQuery();

  const fetchParticipantProjects = useCallback(() => {
    if (!activeLocale) {
      return;
    }

    void listProjectAcceleratorDetails();
  }, [activeLocale, listProjectAcceleratorDetails]);

  useEffect(() => {
    fetchParticipantProjects();
  }, [fetchParticipantProjects]);

  const participantProjects = useMemo(
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
    participantProjects,
    refetch: fetchParticipantProjects,
  };
};
