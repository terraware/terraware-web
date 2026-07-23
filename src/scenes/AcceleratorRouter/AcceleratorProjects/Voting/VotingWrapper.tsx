import React, { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { BusySpinner, ErrorBox } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import useListProjectModules from 'src/hooks/useListProjectModules';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useVotingData from 'src/hooks/useVotingData';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import VoteBadge from './VoteBadge';
import VoteRowGrid from './VoteRowGrid';

export type Props = {
  children: React.ReactNode;
  isForm?: boolean;
  rightComponent?: React.ReactNode;
};

const VotingWrapper = ({ children, isForm, rightComponent }: Props): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const { phaseVotes, project, status } = useVotingData();

  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const { projectModules, listProjectModules } = useListProjectModules();

  const goToProjects = useCallback(() => navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECTS }), [navigate]);

  // Redirect to project management list page if projectId is invalid.
  useEffect(() => {
    if (isNaN(projectId)) {
      goToProjects();
    }
  }, [goToProjects, projectId]);

  useEffect(() => {
    if (status === 'error') {
      snackbar.toastError();
    }
  }, [snackbar, status]);

  useEffect(() => {
    if (project && project.id) {
      void listProjectModules(project.id);
    }
  }, [project, listProjectModules]);

  // construct the bread crumbs back to originating context
  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              name: strings.PROJECTS,
              to: APP_PATHS.ACCELERATOR_PROJECTS,
            },
            {
              name: project?.name ?? '--',
              to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${project?.id}`),
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
      projectPhase={project?.phase}
      modules={projectModules ?? []}
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
