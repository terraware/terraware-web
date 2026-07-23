import { useEffect } from 'react';

import { useLazyGetProjectVotesQuery } from 'src/queries/generated/projectVotes';

const useProjectVotes = (projectId: number) => {
  const [getProjectVotes, { currentData, isFetching, isSuccess, isError }] = useLazyGetProjectVotesQuery();

  useEffect(() => {
    if (!isNaN(projectId)) {
      void getProjectVotes(projectId, true);
    }
  }, [getProjectVotes, projectId]);

  return {
    projectVotes: currentData?.votes,
    isLoading: isFetching,
    isSuccess,
    isError,
  };
};

export default useProjectVotes;
