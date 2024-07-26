import React, { Box, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import VoteBadge from 'src/scenes/AcceleratorRouter/ParticipantProjects/Voting/VoteBadge';
import strings from 'src/strings';
import { PhaseVotes } from 'src/types/Votes';

import ProjectFieldCard from './Card';

const VotingDecisionCard = ({ linkTo, phaseVotes }: { phaseVotes?: PhaseVotes; linkTo?: string }) => {
  const theme = useTheme();

  return (
    <ProjectFieldCard
      height={linkTo ? '128px' : undefined}
      label={strings.VOTING_DECISION}
      value={
        phaseVotes?.decision ? (
          <>
            <Box style={{ margin: 'auto', width: 'fit-content' }}>
              <VoteBadge vote={phaseVotes.decision} />
            </Box>
            {linkTo && (
              <Box marginTop={theme.spacing(1)} textAlign={'center'}>
                <Link fontSize={'16px'} to={linkTo}>
                  {strings.SEE_IC_VOTES}
                </Link>
              </Box>
            )}
          </>
        ) : undefined
      }
    />
  );
};

export default VotingDecisionCard;
