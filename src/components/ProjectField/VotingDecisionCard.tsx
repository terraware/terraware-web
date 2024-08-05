import React, { Box, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import VoteBadge from 'src/scenes/AcceleratorRouter/ParticipantProjects/Voting/VoteBadge';
import strings from 'src/strings';
import { PhaseVotes } from 'src/types/Votes';

import ProjectFieldCard from './Card';

type VotingDecisionCardProps = {
  linkTo?: string;
  md?: number;
  phaseVotes?: PhaseVotes;
};

const VotingDecisionCard = ({ linkTo, md, phaseVotes }: VotingDecisionCardProps) => {
  const theme = useTheme();

  return (
    <ProjectFieldCard
      height={linkTo ? '128px' : undefined}
      label={strings.VOTING_DECISION}
      md={md}
      value={
        <>
          <Box style={{ margin: 'auto', width: 'fit-content' }}>
            {phaseVotes?.decision ? (
              <VoteBadge vote={phaseVotes.decision} />
            ) : (
              <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                N/A
              </Typography>
            )}
          </Box>
          {linkTo && (
            <Box marginTop={theme.spacing(1)} textAlign={'center'}>
              <Link fontSize={'16px'} to={linkTo}>
                {strings.SEE_IC_VOTES}
              </Link>
            </Box>
          )}
        </>
      }
    />
  );
};

export default VotingDecisionCard;
