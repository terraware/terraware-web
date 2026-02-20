import React from 'react';

import { useTheme } from '@mui/material';

import { APP_PATHS } from 'src/constants';
import VoteBadge from 'src/scenes/AcceleratorRouter/AcceleratorProjects/Voting/VoteBadge';
import strings from 'src/strings';
import { PhaseVotes } from 'src/types/Votes';

import ProjectBadgeLink from './ProjectBadgeLink';

type VotingDecisionLinkProps = {
  projectId: string | number | undefined;
  phaseVotes?: PhaseVotes;
};

const VotingDecisionLink = ({ projectId, phaseVotes }: VotingDecisionLinkProps) => {
  const theme = useTheme();
  const linkTo = APP_PATHS.ACCELERATOR_PROJECT_VOTES.replace(':projectId', `${projectId}`);
  return (
    <ProjectBadgeLink
      label={strings.VOTING_DECISION}
      linkTo={linkTo}
      borderLeft={`1px solid ${theme.palette.TwClrBaseGray500}`}
    >
      <VoteBadge vote={phaseVotes?.decision} />
    </ProjectBadgeLink>
  );
};

export default VotingDecisionLink;
