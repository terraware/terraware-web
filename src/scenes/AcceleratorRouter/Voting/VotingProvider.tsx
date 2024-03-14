import { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { requestProjectVotesGet } from 'src/redux/features/votes/votesAsyncThunks';
import { selectProjectVotes } from 'src/redux/features/votes/votesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Phase, PhaseVotes } from 'src/types/Votes';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

import { VotingContext, VotingData } from './VotingContext';

export type Props = {
  children: React.ReactNode;
};

const VotingProvider = ({ children }: Props): JSX.Element => {
  const history = useHistory();
  const query = useQuery();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const phase: Phase = (query.get('phase') as Phase) || 'Phase 1 - Feasibility Study'; // default to phase 1?

  const votes = useAppSelector((state) => selectProjectVotes(state, projectId));

  const [phaseVotes, setPhaseVotes] = useState<PhaseVotes>();
  const [votingData, setVotingData] = useState<VotingData>({ projectId });

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
      const votesForPhase = votes?.data?.phases.find((data) => data.phase === phase);
      if (votesForPhase) {
        setPhaseVotes(votesForPhase);
      } else {
        goToProjects();
      }
    }
  }, [goToProjects, phase, snackbar, votes]);

  // update votes data in context
  useEffect(() => {
    setVotingData({
      phaseVotes,
      projectId,
      projectName: votes?.data?.projectName,
      status: votes?.status ?? 'pending',
    });
  }, [phaseVotes, projectId, votes?.data?.projectName, votes?.status]);

  return <VotingContext.Provider value={votingData}>{children}</VotingContext.Provider>;
};

export default VotingProvider;
