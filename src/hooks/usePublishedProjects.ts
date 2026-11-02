import { useMemo } from 'react';

import { useGetAllProjectsQuery } from 'src/queries/generated/funderProjects';

export const usePublishedProjects = () => {
  const { currentData } = useGetAllProjectsQuery();

  const publishedProjects = useMemo(
    () => currentData?.projects.toSorted((a, b) => (a.dealName || '').localeCompare(b.dealName || '')) ?? null,
    [currentData]
  );

  return { publishedProjects };
};
