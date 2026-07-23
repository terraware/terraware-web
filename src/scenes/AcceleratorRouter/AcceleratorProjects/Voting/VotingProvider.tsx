import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';
import useProjectVotes from 'src/hooks/useProjectVotes';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { Statuses } from 'src/redux/features/asyncUtils';
import { Phase, PhaseVotes } from 'src/types/ProjectVotes';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

import { VotingContext, VotingData } from './VotingContext';

export type Props = {
  children: React.ReactNode;
};

const VotingProvider = ({ children }: Props): JSX.Element => {
  const navigate = useSyncNavigate();
  const query = useQuery();
  const snackbar = useSnackbar();

  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const { selectedProject: project } = useProjects({ projectId });

  const phase: Phase = (query.get('phase') as Phase) || project?.phase || 'Phase 1 - Feasibility Study'; // default to phase 1?

  const { projectVotes, isSuccess, isError } = useProjectVotes(projectId);

  const [phaseVotes, setPhaseVotes] = useState<PhaseVotes>();

  const status: Statuses = useMemo(() => (isError ? 'error' : isSuccess ? 'success' : 'pending'), [isError, isSuccess]);

  const votingData = useMemo<VotingData>(
    () => ({
      phaseVotes,
      project,
      status,
    }),
    [phaseVotes, project, status]
  );

  const goToProjects = useCallback(() => navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECTS }), [navigate]);

  // Redirect to project management list page if projectId is invalid.
  useEffect(() => {
    if (isNaN(projectId)) {
      goToProjects();
    }
  }, [goToProjects, projectId]);

  // find phase votes
  useEffect(() => {
    if (isError) {
      snackbar.toastError();
    } else if (isSuccess && projectVotes) {
      const votesForPhase = projectVotes.phases.find((data) => data.phase === phase);
      if (votesForPhase) {
        setPhaseVotes(votesForPhase);
      }
    }
  }, [phase, snackbar, isError, isSuccess, projectVotes]);

  return <VotingContext.Provider value={votingData}>{children}</VotingContext.Provider>;
};

export default VotingProvider;
