import { useEffect, useState } from 'react';

import { requestListPublishedProjects } from '../redux/features/funder/projects/funderProjectsAsyncThunks';
import { selectPublishedProjects } from '../redux/features/funder/projects/funderProjectsSelectors';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { PublishedProject } from '../types/FunderProject';

export const usePublishedProjects = () => {
  const dispatch = useAppDispatch();
  const [publishedProjects, setPublishedProjects] = useState<PublishedProject[] | null>(null);
  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectPublishedProjects(requestId));

  useEffect(() => {
    if (publishedProjects === null) {
      const request = dispatch(requestListPublishedProjects());
      setRequestId(request.requestId);
    }
  }, [dispatch, publishedProjects]);

  useEffect(() => {
    if (result && result.status === 'success' && result.data) {
      setPublishedProjects(result.data.toSorted((a, b) => (a.dealName || '').localeCompare(b.dealName || '')));
    }
  }, [result]);

  return { publishedProjects };
};
