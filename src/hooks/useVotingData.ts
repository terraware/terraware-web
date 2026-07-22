import { useMemo } from 'react';
import { useParams } from 'react-router';

import useProjectVotes from 'src/hooks/useProjectVotes';
import { useProjects } from 'src/hooks/useProjects';
import { Statuses } from 'src/redux/features/asyncUtils';
import { Phase } from 'src/types/ProjectVotes';
import useQuery from 'src/utils/useQuery';

const useVotingData = () => {
  const query = useQuery();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const { selectedProject: project } = useProjects({ projectId });

  const phase: Phase = (query.get('phase') as Phase) || project?.phase || 'Phase 1 - Feasibility Study'; // default to phase 1?

  const { projectVotes, isSuccess, isError } = useProjectVotes(projectId);

  const phaseVotes = useMemo(() => projectVotes?.phases.find((data) => data.phase === phase), [projectVotes, phase]);

  const status: Statuses = useMemo(() => (isError ? 'error' : isSuccess ? 'success' : 'pending'), [isError, isSuccess]);

  return { phaseVotes, project, status };
};

export default useVotingData;
