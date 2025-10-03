import { useCallback, useEffect, useState } from 'react';

import { useLocalization } from 'src/providers';
import { requestListParticipantProjects } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectsListRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ParticipantProject } from 'src/types/ParticipantProject';
import useSnackbar from 'src/utils/useSnackbar';

export type UseParticipantProjectsResult = {
  error: string | null;
  isLoading: boolean;
  participantProjects: ParticipantProject[];
  refetch: () => void;
};

export const useParticipantProjects = (): UseParticipantProjectsResult => {
  const { activeLocale, strings } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [participantProjects, setParticipantProjects] = useState<ParticipantProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listRequestId, setListRequestId] = useState('');

  const participantProjectsListResult = useAppSelector(selectParticipantProjectsListRequest(listRequestId));

  const fetchParticipantProjects = useCallback(() => {
    if (!activeLocale) {
      return;
    }

    setIsLoading(true);
    setError(null);
    const request = dispatch(requestListParticipantProjects({ locale: activeLocale }));
    setListRequestId(request.requestId);
  }, [activeLocale, dispatch]);

  useEffect(() => {
    fetchParticipantProjects();
  }, [fetchParticipantProjects]);

  useEffect(() => {
    if (participantProjectsListResult?.status === 'error') {
      const errorMessage = strings.GENERIC_ERROR;
      setError(errorMessage);
      snackbar.toastError(errorMessage);
      setIsLoading(false);
    } else if (participantProjectsListResult?.status === 'success') {
      setParticipantProjects(participantProjectsListResult?.data || []);
      setError(null);
      setIsLoading(false);
    }
  }, [participantProjectsListResult, snackbar, strings]);

  return {
    error,
    isLoading,
    participantProjects,
    refetch: fetchParticipantProjects,
  };
};
