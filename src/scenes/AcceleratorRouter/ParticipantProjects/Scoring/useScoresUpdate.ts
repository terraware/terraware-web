import { useCallback, useEffect, useMemo, useState } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import { requestListScores, requestUpdateScores } from 'src/redux/features/scores/scoresAsyncThunks';
import { selectScoreListByRequest, selectScoresUpdateRequest } from 'src/redux/features/scores/scoresSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Phase, Score } from 'src/types/Score';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  status?: Statuses;
  update: (phase: Phase, scores: Score[]) => void;
};

/**
 * Hook to update the scores for a project
 */
export default function useScoresUpdate(projectId: number): Response {
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState('');
  const [listRequestId, setListRequestId] = useState('');
  const result = useAppSelector(selectScoresUpdateRequest(requestId));
  const scoreListResult = useAppSelector(selectScoreListByRequest(listRequestId));

  const update = useCallback(
    (phase: Phase, scores: Score[]) => {
      const dispatched = dispatch(requestUpdateScores({ projectId, phase, scores }));
      setRequestId(dispatched.requestId);
    },
    [dispatch, projectId]
  );

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (result?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      // Refresh scores in store for this project
      const dispatched = dispatch(requestListScores(projectId));
      setListRequestId(dispatched.requestId);
    }
  }, [dispatch, projectId, result, snackbar]);

  return useMemo<Response>(
    () => ({
      // Update is considered successful if both update and refresh list are successful.
      // This is to help with provider data state.
      status: result?.status === 'success' ? scoreListResult?.status : result?.status,
      update,
    }),
    [scoreListResult?.status, result?.status, update]
  );
}
