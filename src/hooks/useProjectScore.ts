import { useCallback } from 'react';

import { useGetProjectOverallScoreQuery, useUpsertProjectScoresMutation } from 'src/queries/generated/projectScores';
import { Score } from 'src/types/ProjectScore';

const useProjectScore = (projectId: number) => {
  const { currentData, isFetching, isSuccess } = useGetProjectOverallScoreQuery(projectId, {
    skip: !projectId,
  });

  const [upsertProjectScores, { isLoading: updateIsLoading, isSuccess: updateIsSuccess }] =
    useUpsertProjectScoresMutation();

  const projectScore: Score | undefined = currentData?.score;

  const updateProjectScore = useCallback(
    (score: Score) => {
      void upsertProjectScores({
        projectId,
        updateProjectOverallScoreRequestPayload: { score },
      });
    },
    [projectId, upsertProjectScores]
  );

  return {
    projectScore,
    updateProjectScore,
    isLoading: isFetching,
    isSuccess,
    updateIsLoading,
    updateIsSuccess,
  };
};

export default useProjectScore;
