import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestProjectScore, requestUpdateProjectScore } from 'src/redux/features/scores/scoresAsyncThunks';
import { selectScore, selectScoreUpdateRequest } from 'src/redux/features/scores/scoresSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Score } from 'src/types/Score';

const useProjectScore = (projectId: number) => {
  const dispatch = useAppDispatch();

  const [updateRequestId, setUpdateRequestId] = useState('');

  const projectScoreRequest = useAppSelector(selectScore(projectId));
  const updateRequest = useAppSelector(selectScoreUpdateRequest(updateRequestId));

  const [projectScore, setProjectScore] = useState<Score>();

  const getProjectScore = useCallback(() => {
    dispatch(requestProjectScore(projectId));
  }, [dispatch, projectId]);

  const updateProjectScore = useCallback(
    (score: Score) => {
      const request = dispatch(requestUpdateProjectScore({ projectId, score }));
      setUpdateRequestId(request.requestId);
    },
    [dispatch, projectId, setUpdateRequestId]
  );

  useEffect(() => {
    getProjectScore();
  }, [getProjectScore]);

  useEffect(() => {
    if (projectScoreRequest && projectScoreRequest.status === 'success') {
      setProjectScore(projectScoreRequest.data);
    }
  }, [projectScoreRequest, setProjectScore]);

  useEffect(() => {
    if (updateRequest && updateRequest.status === 'success') {
      getProjectScore();
    }
  }, [updateRequest, getProjectScore]);

  return useMemo(
    () => ({
      projectScore,
      getProjectScore,
      updateProjectScore,
      getStatus: projectScoreRequest?.status,
      updateStatus: updateRequest?.status,
    }),
    [updateRequest, projectScore, getProjectScore]
  );
};

export default useProjectScore;
