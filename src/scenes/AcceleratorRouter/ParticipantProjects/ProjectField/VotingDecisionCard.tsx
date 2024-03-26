import { Box } from '@mui/material';

import VoteBadge from 'src/scenes/AcceleratorRouter/Voting/VoteBadge';
import strings from 'src/strings';
import { ParticipantProject } from 'src/types/ParticipantProject';

import ProjectFieldCard from './Card';

const VotingDecisionCard = ({ project }: { project: ParticipantProject }) => {
  return (
    <ProjectFieldCard
      label={strings.VOTING_DECISION}
      value={
        project.votingDecision ? (
          <Box style={{ margin: 'auto', width: 'fit-content' }}>
            <VoteBadge vote={project.votingDecision} />
          </Box>
        ) : undefined
      }
    />
  );
};

export default VotingDecisionCard;
