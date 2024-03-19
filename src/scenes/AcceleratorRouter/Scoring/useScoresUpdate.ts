import { useCallback, useEffect, useMemo, useState } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import { requestListScores, requestUpdateScores } from 'src/redux/features/scores/scoresAsyncThunks';
import { selectScoresUpdateRequest } from 'src/redux/features/scores/scoresSelectors';
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
  const result = useAppSelector(selectScoresUpdateRequest(requestId));

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
      dispatch(requestListScores(projectId));
    }
  }, [dispatch, projectId, result, snackbar]);

  return useMemo<Response>(
    () => ({
      status: result?.status,
      update,
    }),
    [result?.status, update]
  );
}
