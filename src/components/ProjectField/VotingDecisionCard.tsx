import { Box } from '@mui/material';

import VoteBadge from 'src/scenes/AcceleratorRouter/Voting/VoteBadge';
import strings from 'src/strings';
import { PhaseVotes } from 'src/types/Votes';

import ProjectFieldCard from './Card';

const VotingDecisionCard = ({ phaseVotes }: { phaseVotes?: PhaseVotes }) => {
  return (
    <ProjectFieldCard
      label={strings.VOTING_DECISION}
      value={
        phaseVotes?.decision ? (
          <Box style={{ margin: 'auto', width: 'fit-content' }}>
            <VoteBadge vote={phaseVotes.decision} />
          </Box>
        ) : undefined
      }
    />
  );
};

export default VotingDecisionCard;
