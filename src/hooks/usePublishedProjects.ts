import { useEffect, useMemo, useRef, useState } from 'react';

import { requestListPublishedProjects } from '../redux/features/funder/projects/funderProjectsAsyncThunks';
import { selectPublishedProjects } from '../redux/features/funder/projects/funderProjectsSelectors';
import { useAppDispatch, useAppSelector } from '../redux/store';

export const usePublishedProjects = () => {
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const hasFetched = useRef(false);
  const result = useAppSelector(selectPublishedProjects(requestId));

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const request = dispatch(requestListPublishedProjects());
      setRequestId(request.requestId);
    }
  }, [dispatch]);

  const publishedProjects = useMemo(
    () =>
      result?.status === 'success' && result.data
        ? result.data.toSorted((a, b) => (a.dealName || '').localeCompare(b.dealName || ''))
        : null,
    [result]
  );

  return { publishedProjects };
};
