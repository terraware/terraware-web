import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { Statuses } from 'src/redux/features/asyncUtils';
import { requestProjectVotesGet } from 'src/redux/features/votes/votesAsyncThunks';
import { selectProjectVotes } from 'src/redux/features/votes/votesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { PhaseVotes } from 'src/types/Votes';
import useSnackbar from 'src/utils/useSnackbar';

export type Props = {
  phase: string;
  projectId: number;
};

export type Response = {
  status: Statuses;
  phaseVotes?: PhaseVotes;
  projectName?: string;
};

export default function useFetchVotes({ phase, projectId }: Props): Response {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [phaseVotes, setPhaseVotes] = useState<PhaseVotes>();
  const votes = useAppSelector((state) => selectProjectVotes(state, projectId));

  const goToProjects = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_OVERVIEW }); // TODO switch to project management lists page
  }, [history]);

  // Redirect to project management list page if projectId is invalid.
  // Otherwise fetch the votes.
  useEffect(() => {
    if (isNaN(projectId)) {
      goToProjects();
    } else {
      dispatch(requestProjectVotesGet(projectId));
    }
  }, [dispatch, goToProjects, projectId]);

  // find phase votes
  useEffect(() => {
    if (votes?.status === 'error') {
      snackbar.toastError();
    } else if (votes?.status === 'success') {
      const votesForPhase = votes?.data?.phases.find((data) => data.cohortPhase === phase);
      if (votesForPhase) {
        setPhaseVotes(votesForPhase);
      } else {
        goToProjects();
      }
    }
  }, [goToProjects, phase, snackbar, votes]);

  return useMemo<Response>(
    () => ({
      phaseVotes,
      projectName: votes?.data?.projectName,
      status: votes?.status ?? 'pending',
    }),
    [phaseVotes, votes?.data?.projectName, votes?.status]
  );
}
