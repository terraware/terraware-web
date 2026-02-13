import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { selectProject } from 'src/redux/features/projects/projectsSelectors';
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
  const navigate = useSyncNavigate();
  const query = useQuery();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const project = useAppSelector(selectProject(projectId));

  const phase: Phase = (query.get('phase') as Phase) || project?.phase || 'Phase 1 - Feasibility Study'; // default to phase 1?

  const votes = useAppSelector((state) => selectProjectVotes(state, projectId));

  const [phaseVotes, setPhaseVotes] = useState<PhaseVotes>();
  const [votingData, setVotingData] = useState<VotingData>({ project });

  const goToProjects = useCallback(() => navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECTS }), [navigate]);

  // Redirect to project management list page if projectId is invalid.
  // Otherwise fetch the votes.
  useEffect(() => {
    if (isNaN(projectId)) {
      goToProjects();
    } else {
      void dispatch(requestProjectVotesGet(projectId));
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
      }
    }
  }, [phase, snackbar, votes]);

  // update votes data in context
  useEffect(() => {
    setVotingData({
      phaseVotes,
      project,
      status: votes?.status ?? 'pending',
    });
  }, [phaseVotes, project, votes?.status]);

  return <VotingContext.Provider value={votingData}>{children}</VotingContext.Provider>;
};

export default VotingProvider;
