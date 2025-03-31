import { useEffect, useState } from 'react';

import { requestListParticipantProjects } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectsListRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ParticipantProject } from 'src/types/ParticipantProject';

export const useAcceleratorProjects = () => {
  const dispatch = useAppDispatch();
  const [allProjects, setAllProjects] = useState<ParticipantProject[] | null>(null);
  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantProjectsListRequest(requestId));

  useEffect(() => {
    if (allProjects === null) {
      const request = dispatch(requestListParticipantProjects({}));
      setRequestId(request.requestId);
    }
  }, [dispatch, allProjects]);

  useEffect(() => {
    if (result && result.status === 'success' && result.data) {
      setAllProjects(result.data.sort((a, b) => (a.dealName || '').localeCompare(b.dealName || '')));
    }
  }, [result]);

  return { allProjects };
};
