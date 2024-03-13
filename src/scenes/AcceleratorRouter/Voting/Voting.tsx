import { useCallback, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Box, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { VoteOption } from 'src/types/Votes';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { getUserDisplayName } from 'src/utils/user';

import VoteInfo from './VoteInfo';
import useFetchVotes from './useFetchVotes';

const Voting = () => {
  const history = useHistory();
  const query = useQuery();
  const location = useStateLocation();
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const phase = query.get('phase') || 'phase 1'; // default to phase 1?

  const { status, phaseVotes, projectName } = useFetchVotes({ phase, projectId });

  const goToEditVotes = useCallback(() => {
    // keep query state for edit view
    history.push(getLocation(APP_PATHS.ACCELERATOR_VOTING_EDIT.replace(':projectId', `${projectId}`), location));
  }, [history, location, projectId]);

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

  // Edit Votes button
  const editVotes = useMemo(
    () =>
      activeLocale ? (
        <Button label={strings.EDIT_VOTES} icon='iconEdit' onClick={goToEditVotes} size='medium' id='editVotes' />
      ) : null,
    [activeLocale, goToEditVotes]
  );

  return (
    <Page
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      rightComponent={editVotes}
      title={strings.INVESTMENT_COMMITTEE_VOTES}
    >
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {status === 'pending' && <BusySpinner withSkrim={true} />}
        <Box
          sx={{
            background: theme.palette.TwClrBaseGray050,
            borderRadius: theme.spacing(2),
            gap: theme.spacing(8),
            padding: theme.spacing(2),
          }}
        >
          <VoteInfo title={strings.VOTING_DECISION} voteOption={voteDecision} />
        </Box>
        {phaseVotes?.votes.map((vote) => (
          <Box
            key={vote.userId}
            sx={{
              borderBottom: `1px solid ${theme.palette.TwClrBaseGray050}`,
              gap: theme.spacing(8),
              padding: theme.spacing(2),
              '&:last-child': {
                borderBottom: 'none',
                paddingBottom: 0,
              },
            }}
          >
            <VoteInfo
              conditionalInfo={vote.conditionalInfo}
              title={strings.formatString(strings.VOTER, getUserDisplayName(vote))}
              voteOption={vote.voteOption}
            />
          </Box>
        ))}
      </Card>
    </Page>
  );
};

export default Voting;
