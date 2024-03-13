import { useCallback, useEffect, useMemo, useState } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import { selectDeliverablesEditRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { requestListScores, requestUpdateScores } from 'src/redux/features/scores/scoresAsyncThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Score } from 'src/types/Score';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  status?: Statuses;
  update: (scores: Score[]) => void;
};

/**
 * Hook to update the scores for a project
 */
export default function useScoresUpdate(projectId: number): Response {
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState('');
  const result = useAppSelector(selectDeliverablesEditRequest(requestId));

  const update = useCallback(
    (scores: Score[]) => {
      const dispatched = dispatch(requestUpdateScores({ projectId, scores }));
      setRequestId(dispatched.requestId);
    },
    [dispatch, projectId]
  );

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (result?.status === 'success') {
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
