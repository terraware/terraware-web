import { useEffect, useMemo, useState } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import { requestListScores } from 'src/redux/features/scores/scoresAsyncThunks';
import { selectScoreListRequest } from 'src/redux/features/scores/scoresSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Scorecard } from 'src/types/Score';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  status: Statuses;
  projectName?: string;
  scorecards?: Scorecard[];
};

/**
 * Hook to get the list of scores for a project
 * Returns status of request and the list
 */
export default function useScoreList(projectId: number): Response {
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [scorecards, setScorecards] = useState<Scorecard[]>();

  const scoreListResult = useAppSelector(selectScoreListRequest(requestId));

  useEffect(() => {
    if (!isNaN(projectId)) {
      const request = dispatch(requestListScores(projectId));
      setRequestId(request.requestId);
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (scoreListResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (scoreListResult?.status === 'success' && scoreListResult?.data?.scorecards) {
      setProjectName(scoreListResult.data.projectName);
      setScorecards(scoreListResult.data.scorecards);
    }
  }, [scoreListResult?.status, scoreListResult?.data, snackbar]);

  return useMemo<Response>(
    () => ({
      status: scoreListResult?.status ?? 'pending',
      scorecards,
      projectName,
    }),
    [scoreListResult, scorecards, projectName]
  );
}
