import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectScore from 'src/hooks/useProjectScore';
import { useLocalization, useUser } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import PlantsDashboardView from 'src/scenes/PlantsDashboardRouter/PlantsDashboardView';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import { useParticipantProjectData } from './ParticipantProjectContext';
import ProjectDeliverablesView from './ProjectDeliverablesView';
import ProjectDocumentsView from './ProjectDocumentsView';
import ProjectProfileView from './ProjectProfileView';
import ProjectVariablesView from './ProjectVariablesView';
import { useVotingData } from './Voting/VotingContext';

const ProjectPage = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { isAllowed } = useUser();
  const projectData = useParticipantProjectData();
  const { goToDocumentNew, goToParticipantProjectEdit } = useNavigateTo();
  const { getApplicationByProjectId } = useApplicationData();
  const { projectScore } = useProjectScore(projectData.projectId);
  const { phaseVotes } = useVotingData();

  const isAllowedEdit = isAllowed('UPDATE_PARTICIPANT_PROJECT');

  const projectApplication = useMemo(
    () => getApplicationByProjectId(projectData.projectId),
    [getApplicationByProjectId, projectData.projectId]
  );

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'projectProfile',
        label: strings.PROJECT_PROFILE,
        children: (
          <ProjectProfileView
            {...projectData}
            projectDetails={projectData.participantProject}
            projectApplication={projectApplication}
            projectScore={projectScore}
            phaseVotes={phaseVotes}
          />
        ),
      },
      {
        id: 'deliverables',
        label: strings.DELIVERABLES,
        children: <ProjectDeliverablesView projectId={projectData.projectId} />,
      },
      {
        id: 'documents',
        label: strings.DOCUMENTS,
        children: <ProjectDocumentsView projectId={projectData.projectId} />,
      },
      {
        id: 'variables',
        label: strings.VARIABLES,
        children: <ProjectVariablesView projectId={projectData.projectId} />,
      },
      {
        id: 'plantsDashboard',
        label: strings.PLANTS_DASHBOARD,
        children: (
          <PlantsDashboardView
            projectId={projectData.projectId}
            organizationId={projectData?.project?.organizationId || projectApplication?.organizationId}
          />
        ),
      },
    ];
  }, [activeLocale, projectData, projectApplication, projectScore, phaseVotes]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'projectProfile',
    tabs,
    viewIdentifier: 'funder-home',
    keepQuery: false,
  });

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='column' justifyContent='center' minHeight={80}>
        <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
          {activeTab === 'projectProfile' && isAllowedEdit && (
            <Button
              id='editProject'
              icon='iconEdit'
              label={strings.EDIT_PROJECT}
              priority='primary'
              onClick={() => goToParticipantProjectEdit(projectData.projectId)}
              size='medium'
              type='productive'
            />
          )}

          {activeTab === 'documents' && (
            <Button
              icon='plus'
              id='createDocument'
              label={strings.ADD_DOCUMENT}
              onClick={goToDocumentNew}
              priority='primary'
              size='medium'
              type='productive'
            />
          )}
        </Box>
      </Box>
    ),
    [activeTab, goToParticipantProjectEdit, isAllowedEdit, projectData.projectId, theme, goToDocumentNew]
  );

  const projectViewTitle = (
    <Box paddingLeft={1}>
      <Typography fontSize={'24px'} fontWeight={600}>
        {projectData.participantProject?.dealName}
      </Typography>
    </Box>
  );

  return (
    <Page
      title={projectViewTitle}
      crumbs={projectData.crumbs}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
    >
      {projectData.status === 'pending' && <BusySpinner />}

      <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
    </Page>
  );
};

export default ProjectPage;
