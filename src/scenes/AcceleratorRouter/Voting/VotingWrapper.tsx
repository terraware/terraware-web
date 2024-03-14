import { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { VoteOption } from 'src/types/Votes';

import VoteInfo from './VoteInfo';
import { useVotingData } from './VotingContext';

export type Props = {
  children: React.ReactNode;
  isForm?: boolean;
  rightComponent?: React.ReactNode;
};

const VotingWrapper = ({ children, isForm, rightComponent }: Props): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { phaseVotes, projectId, projectName, status } = useVotingData();

  // construct the bread crumbs back to originating context
  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              name: strings.PROJECTS,
              to: APP_PATHS.ACCELERATOR_OVERVIEW, // TODO switch to project management page holding the project id
            },
            {
              name: projectName ?? '--',
              to: APP_PATHS.ACCELERATOR_SCORING.replace(':projectId', `${projectId}`), // TODO switch to project management page holding the project id
            },
          ]
        : [],
    [activeLocale, projectId, projectName]
  );

  // vote decision, pick the majority or undefined if no majority
  // this will eventually come from the BE
  const voteDecision = useMemo<VoteOption | undefined>(() => {
    let decision: VoteOption | undefined;

    // confirm all users have their votes in
    if (phaseVotes && phaseVotes.votes.every((vote) => !!vote.voteOption)) {
      // create map of vote-option to number of votes
      const results = phaseVotes.votes.reduce(
        (acc, vote) => {
          if (!acc[vote.voteOption!]) {
            acc[vote.voteOption!] = 1;
          } else {
            acc[vote.voteOption!]++;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      // select vote-option with max number of votes, if there is no tie
      const max = Math.max(...Object.values(results));
      const winner = Object.keys(results).filter((key) => results[key] === max);
      if (winner.length === 1) {
        decision = winner[0] as VoteOption;
      }
    }

    return decision;
  }, [phaseVotes]);

  return (
    <Page
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
      title={strings.INVESTMENT_COMMITTEE_VOTES}
    >
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: theme.spacing(isForm ? 0 : 3) }}>
        {status === 'pending' && <BusySpinner withSkrim={true} />}
        <Box
          sx={{
            background: theme.palette.TwClrBaseGray050,
            borderRadius: theme.spacing(2),
            gap: theme.spacing(8),
            padding: theme.spacing(2),
            margin: theme.spacing(isForm ? 3 : 0),
          }}
        >
          <VoteInfo title={strings.VOTING_DECISION} voteOption={voteDecision} />
        </Box>
        {children}
      </Card>
    </Page>
  );
};

export default VotingWrapper;
