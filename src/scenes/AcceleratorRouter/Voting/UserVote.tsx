import { Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import strings from 'src/strings';
import { VoteSelection } from 'src/types/Votes';
import { getUserDisplayName } from 'src/utils/user';

import VoteBadge from './VoteBadge';
import VoteRowGrid from './VoteRowGrid';

export type UserVoteViewProps = {
  vote: VoteSelection;
};

export const UserVoteView = ({ vote }: UserVoteViewProps): JSX.Element => {
  const theme = useTheme();

  return (
    <>
      <VoteRowGrid leftChild={<UserLabel vote={vote} />} rightChild={<VoteBadge vote={vote.voteOption} />} />
      {/* This is mostly for the top row alignment where title and badge are aligned by center. */}
      {vote.voteOption === 'Conditional' && !!vote.conditionalInfo && (
        <VoteRowGrid
          rightChild={
            <Textfield
              display
              id='vote-conditional-info'
              label={''}
              preserveNewlines
              type='textarea'
              value={vote.conditionalInfo}
            />
          }
          style={{ marginTop: theme.spacing(1) }}
        />
      )}
    </>
  );
};

/**
 * label showing Voter: <name>
 */
type UserLabelProps = {
  vote: VoteSelection;
};

const UserLabel = ({ vote }: UserLabelProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Typography color={theme.palette.TwClrBaseBlack} fontSize='16px' fontWeight={400} lineHeight='24px'>
      {strings.formatString(strings.VOTER, getUserDisplayName(vote))}
    </Typography>
  );
};
