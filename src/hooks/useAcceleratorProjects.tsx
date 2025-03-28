import { useEffect, useState } from 'react';

import { requestListParticipantProjects } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectsListRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ParticipantProject } from 'src/types/ParticipantProject';

export const useAcceleratorProjects = () => {
  const dispatch = useAppDispatch();
  const [allProjects, setAllProjects] = useState<ParticipantProject[]>([]);
  const [requestId, setRequestId] = useState<string>('');
  const [bootstrapped, setBootstrapped] = useState<boolean>(false);
  const result = useAppSelector(selectParticipantProjectsListRequest(requestId));

  useEffect(() => {
    if (allProjects.length === 0) {
      const request = dispatch(requestListParticipantProjects({}));
      setRequestId(request.requestId);
    }
  }, []);

  useEffect(() => {
    if (result?.status === 'success' && result?.data) {
      setAllProjects(result?.data || []);
      setBootstrapped(true);
    }
  }, [dispatch, allProjects, result]);

  return { allProjects, bootstrapped };
};
