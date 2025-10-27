import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DropdownItem, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import ActivityHighlightsModal from 'src/components/ActivityLog/ActivityHighlightsModal';
import Page from 'src/components/Page';
import OptionsMenu from 'src/components/common/OptionsMenu';
import isEnabled from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectScore from 'src/hooks/useProjectScore';
import { useLocalization, useUser } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import { requestListFunderReports } from 'src/redux/features/funder/entities/fundingEntitiesAsyncThunks';
import { selectListFunderReports } from 'src/redux/features/funder/entities/fundingEntitiesSelectors';
import { requestPublishFunderProject } from 'src/redux/features/funder/projects/funderProjectsAsyncThunks';
import { selectPublishFunderProject } from 'src/redux/features/funder/projects/funderProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import PlantsDashboardView from 'src/scenes/PlantsDashboardRouter/PlantsDashboardView';
import strings from 'src/strings';
import { PublishedReport } from 'src/types/AcceleratorReport';
import { FunderProjectDetails } from 'src/types/FunderProject';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStickyTabs from 'src/utils/useStickyTabs';

import { useParticipantProjectData } from './ParticipantProjectContext';
import ProjectActivityLogView from './ProjectActivityLogView';
import ProjectDeliverablesView from './ProjectDeliverablesView';
import ProjectDocumentsView from './ProjectDocumentsView';
import ProjectProfileView from './ProjectProfileView';
import ProjectVariablesView from './ProjectVariablesView';
import PublishModal from './Reports/PublishModal';
import { useVotingData } from './Voting/VotingContext';

const ProjectPage = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { isAllowed } = useUser();
  const projectData = useParticipantProjectData();
  const { goToAcceleratorActivityCreate, goToDocumentNew, goToParticipantProjectEdit } = useNavigateTo();
  const { getApplicationByProjectId } = useApplicationData();
  const { projectScore } = useProjectScore(projectData.projectId);
  const { phaseVotes } = useVotingData();
  const dispatch = useAppDispatch();
  const query = useQuery();
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [publishRequestId, setPublishRequestId] = useState('');
  const [publishedReports, setPublishedReports] = useState<PublishedReport[]>([]);
  const publishProfileResponse = useAppSelector(selectPublishFunderProject(publishRequestId));
  const snackbar = useSnackbar();
  const { isDesktop, isMobile } = useDeviceInfo();

  const isActivityHighlightEnabled = isEnabled('Activity Log Highlights');
  const isAllowedEdit = isAllowed('UPDATE_PARTICIPANT_PROJECT');
  const isAllowedPublish = isAllowed('PUBLISH_PROJECT_DETAILS');
  const isAllowedCreateActivities = isAllowed('CREATE_ACTIVITIES');

  const [activityId, setActivityId] = useState<number>();
  const [highlightsModalOpen, setHighlightsModalOpen] = useState(false);

  useEffect(() => {
    const _activityId = query.get('activityId');
    setActivityId(_activityId ? Number(_activityId) : undefined);
  }, [query]);

  const projectApplication = useMemo(
    () => getApplicationByProjectId(projectData.projectId),
    [getApplicationByProjectId, projectData.projectId]
  );

  const reportsResponse = useAppSelector(selectListFunderReports(projectData.projectId.toString()));

  useEffect(() => {
    if (reportsResponse?.status === 'success') {
      setPublishedReports(reportsResponse.data || []);
    }
  }, [reportsResponse]);

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
            publishedReports={publishedReports}
          />
        ),
      },
      {
        id: 'activityLog',
        label: strings.PROJECT_ACTIVITY,
        children: <ProjectActivityLogView projectId={projectData.projectId} />,
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
  }, [activeLocale, projectData, projectApplication, projectScore, phaseVotes, publishedReports]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'projectProfile',
    tabs,
    viewIdentifier: 'project-profile',
  });

  const goToProjectEdit = useCallback(
    () => goToParticipantProjectEdit(projectData.projectId),
    [goToParticipantProjectEdit, projectData.projectId]
  );

  const goToProjectActivityCreate = useCallback(() => {
    goToAcceleratorActivityCreate(projectData.projectId);
  }, [goToAcceleratorActivityCreate, projectData.projectId]);

  const openActivityHighlightsPreview = useCallback(() => {
    setHighlightsModalOpen(true);
  }, []);

  const closePublishDialog = useCallback(() => setOpenPublishDialog(false), []);

  const publishProfile = useCallback(() => {
    const funderProjectDetails: FunderProjectDetails = {
      ...projectData.participantProject,
      projectId: projectData.projectId,
      carbonCertifications: projectData.participantProject?.carbonCertifications || [],
      landUseModelTypes: projectData.participantProject?.landUseModelTypes || [],
      landUseModelHectares: projectData.participantProject?.landUseModelHectares || {},
      metricProgress: projectData.participantProject?.metricProgress ?? [],
      sdgList: projectData.participantProject?.sdgList || [],
    };
    const request = dispatch(requestPublishFunderProject(funderProjectDetails));
    setPublishRequestId(request.requestId);
  }, [dispatch, projectData.participantProject, projectData.projectId]);

  const onOptionItemClick = useCallback((optionItem: DropdownItem) => {
    if (optionItem.value === 'publish') {
      setOpenPublishDialog(true);
    }
  }, []);

  useEffect(() => {
    if (publishProfileResponse?.status === 'error') {
      snackbar.toastError();
      return;
    }
    if (publishProfileResponse?.status === 'success') {
      snackbar.toastSuccess(strings.PROJECT_PROFILE_PUBLISHED);
      closePublishDialog();
    }
  }, [closePublishDialog, snackbar, publishProfileResponse]);

  useEffect(() => {
    void dispatch(requestListFunderReports(projectData.projectId));
  }, [dispatch, projectData.projectId]);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='column' justifyContent='center' minHeight={80}>
        <Box
          display='flex'
          flexDirection='row'
          flexGrow={0}
          marginRight={theme.spacing(3)}
          justifyContent={isDesktop ? 'flex-end' : 'flex-start'}
        >
          {activeTab === 'projectProfile' && isAllowedEdit && (
            <>
              <Button
                id='editProject'
                icon='iconEdit'
                label={strings.EDIT_PROJECT}
                priority='primary'
                onClick={goToProjectEdit}
                size='medium'
                sx={{ whiteSpace: 'nowrap' }}
                type='productive'
              />
              {isAllowedPublish && (
                <OptionsMenu
                  size={'medium'}
                  onOptionItemClick={onOptionItemClick}
                  optionItems={[{ label: strings.PUBLISH, value: 'publish' }]}
                />
              )}
            </>
          )}

          {activeTab === 'activityLog' && isAllowedCreateActivities && !activityId && (
            <Box
              alignItems='center'
              display='flex'
              flexDirection='row'
              flexWrap={isMobile ? 'wrap' : 'nowrap'}
              justifyContent={isDesktop ? 'flex-end' : 'flex-start'}
            >
              <Button
                icon='plus'
                id='addActivity'
                label={strings.ADD_ACTIVITY}
                onClick={goToProjectActivityCreate}
                priority='primary'
                size='medium'
                sx={{ minWidth: '160px', whiteSpace: 'nowrap' }}
                type='productive'
              />
              {isActivityHighlightEnabled && (
                <Button
                  id='previewHighlights'
                  label={strings.PREVIEW_HIGHLIGHTS}
                  onClick={openActivityHighlightsPreview}
                  priority='secondary'
                  size='medium'
                  sx={{ minWidth: '180px', whiteSpace: 'nowrap' }}
                  type='productive'
                />
              )}
            </Box>
          )}

          {activeTab === 'documents' && (
            <Button
              icon='plus'
              id='createDocument'
              label={strings.ADD_DOCUMENT}
              onClick={goToDocumentNew}
              priority='primary'
              size='medium'
              sx={{ whiteSpace: 'nowrap' }}
              type='productive'
            />
          )}
        </Box>
      </Box>
    ),
    [
      activeTab,
      activityId,
      goToDocumentNew,
      goToProjectActivityCreate,
      goToProjectEdit,
      isActivityHighlightEnabled,
      isAllowedCreateActivities,
      isAllowedEdit,
      isAllowedPublish,
      isDesktop,
      isMobile,
      onOptionItemClick,
      openActivityHighlightsPreview,
      theme,
    ]
  );

  const projectViewTitle = (
    <Box paddingLeft={1}>
      <Typography fontSize={'24px'} fontWeight={600}>
        {projectData.participantProject?.dealName}
      </Typography>
    </Box>
  );

  return (
    <>
      {openPublishDialog && <PublishModal onClose={closePublishDialog} onSubmit={publishProfile} />}
      <Page
        title={projectViewTitle}
        crumbs={projectData.crumbs}
        hierarchicalCrumbs={false}
        rightComponent={rightComponent}
      >
        {isActivityHighlightEnabled && highlightsModalOpen && (
          <ActivityHighlightsModal
            open={highlightsModalOpen}
            projectId={projectData.projectId}
            setOpen={setHighlightsModalOpen}
            title={projectData.participantProject?.dealName}
          />
        )}
        {projectData.status === 'pending' && <BusySpinner />}

        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Page>
    </>
  );
};

export default ProjectPage;
