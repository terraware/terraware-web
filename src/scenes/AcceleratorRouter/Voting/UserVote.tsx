import { useMemo } from 'react';

import { Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dropdown, Textfield } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { VoteOption, VoteSelection } from 'src/types/Votes';
import { UserIdentity, getUserDisplayName } from 'src/utils/user';

import VoteBadge from './VoteBadge';
import VoteRowGrid from './VoteRowGrid';

const useStyles = makeStyles(() => ({
  textareaEdit: {
    '& .textfield-value': {
      maxWidth: '500px',
      minHeight: '100px',
    },
  },
}));

/**
 * Read-only view of user vote
 */
export type UserVoteViewProps = {
  vote: VoteSelection;
};

export const UserVoteView = ({ vote }: UserVoteViewProps): JSX.Element => {
  const theme = useTheme();

  const user: UserIdentity = {
    firstName: vote.firstName,
    lastName: vote.lastName,
    email: vote.email,
  };

  return (
    <>
      <VoteRowGrid leftChild={<UserLabel user={user} />} rightChild={<VoteBadge vote={vote.voteOption} />} />
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
          style={{ marginTop: theme.spacing(2) }}
        />
      )}
    </>
  );
};

/**
 * Edit view of user vote
 */
export type UserVoteEditProps = {
  conditionalInfo?: string;
  onConditionalInfoChange: (conditionalInfo: string) => void;
  onVoteChange: (vote: VoteOption) => void;
  user: UserIdentity;
  validate?: boolean;
  voteOption?: VoteOption;
};

export const UserVoteEdit = ({
  conditionalInfo,
  onConditionalInfoChange,
  onVoteChange,
  user,
  validate,
  voteOption,
}: UserVoteEditProps): JSX.Element => {
  const theme = useTheme();
  const classes = useStyles();
  const { activeLocale } = useLocalization();

  const voteOptions = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      { label: strings.YES, value: 'Yes' },
      { label: strings.NO, value: 'No' },
      { label: strings.CONDITIONAL, value: 'Conditional' },
      { label: strings.NOT_COMPLETE, value: undefined },
    ];
  }, [activeLocale]);

  return (
    <>
      <VoteRowGrid
        leftChild={<UserLabel user={user} />}
        rightChild={
          <Dropdown
            label={''}
            onChange={(value) => onVoteChange(value as VoteOption)}
            options={voteOptions}
            selectedValue={voteOption}
          />
        }
      />
      {/* This is mostly for the top row alignment where title and badge are aligned by center. */}
      {voteOption === 'Conditional' && (
        <VoteRowGrid
          rightChild={
            <Textfield
              className={classes.textareaEdit}
              errorText={validate && !conditionalInfo ? strings.REQUIRED_FIELD : ''}
              id='vote-conditional-info'
              label={strings.COMMENTS}
              onChange={(value) => onConditionalInfoChange(value as string)}
              preserveNewlines
              required
              type='textarea'
              value={conditionalInfo}
            />
          }
          style={{ marginTop: theme.spacing(2) }}
        />
      )}
    </>
  );
};

/**
 * label showing Voter: <name>
 */
type UserLabelProps = {
  user?: UserIdentity;
};

const UserLabel = ({ user }: UserLabelProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Typography color={theme.palette.TwClrBaseBlack} fontSize='16px' fontWeight={400} lineHeight='24px'>
      {strings.formatString(strings.VOTER, getUserDisplayName(user))}
    </Typography>
  );
};
