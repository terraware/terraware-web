import React, { useEffect, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { BusySpinner, ErrorBox } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import useListModules from 'src/hooks/useListModules';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import VoteBadge from './VoteBadge';
import VoteRowGrid from './VoteRowGrid';
import { useVotingData } from './VotingContext';

export type Props = {
  children: React.ReactNode;
  isForm?: boolean;
  rightComponent?: React.ReactNode;
};

const VotingWrapper = ({ children, isForm, rightComponent }: Props): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { phaseVotes, project, status } = useVotingData();

  const { modules, listModules } = useListModules();

  useEffect(() => {
    if (project) {
      void listModules({ projectId: project.id });
    }
  }, [project, listModules]);

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
              name: project?.name ?? '--',
              to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${project?.id}`),
            },
            {
              name: strings.SCORES,
              to: APP_PATHS.ACCELERATOR_PROJECT_SCORES.replace(':projectId', `${project?.id}`),
            },
          ]
        : [],
    [activeLocale, project]
  );

  const voteDecision = phaseVotes?.decision;

  return (
    <PageWithModuleTimeline
      contentStyle={isForm ? { flexGrow: 1 } : {}}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
      title={strings.INVESTMENT_COMMITTEE_VOTES}
      cohortPhase={project?.cohortPhase}
      modules={modules ?? []}
    >
      {phaseVotes && phaseVotes.votes.length > 0 ? (
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            padding: theme.spacing(isForm ? 0 : 3),
          }}
        >
          {status === 'pending' && <BusySpinner withSkrim={true} />}
          <Box
            sx={{
              background: theme.palette.TwClrBaseGray050,
              borderRadius: theme.spacing(2),
              gap: theme.spacing(8),
              padding: theme.spacing(2),
              margin: isForm ? theme.spacing(3, 3, 0) : 0,
            }}
          >
            <VoteRowGrid leftChild={strings.VOTING_DECISION} rightChild={<VoteBadge vote={voteDecision} />} />
          </Box>
          {children}
        </Card>
      ) : (
        <ErrorBox title={strings.NO_VOTERS} text={strings.NO_VOTERS_FOR_PROJECT} />
      )}
    </PageWithModuleTimeline>
  );
};

export default VotingWrapper;
