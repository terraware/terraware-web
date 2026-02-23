import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DropdownItem, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import OptionsMenu from 'src/components/common/OptionsMenu';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectScore from 'src/hooks/useProjectScore';
import { useLocalization, useUser } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import { useListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import { requestPublishFunderProject } from 'src/redux/features/funder/projects/funderProjectsAsyncThunks';
import { selectPublishFunderProject } from 'src/redux/features/funder/projects/funderProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import PlantsDashboardView from 'src/scenes/PlantsDashboardRouter/PlantsDashboardView';
import { FunderProjectDetails } from 'src/types/FunderProject';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStickyTabs from 'src/utils/useStickyTabs';

import { useAcceleratorProjectData } from './AcceleratorProjectContext';
import ProjectActivityLogView from './ProjectActivityLogView';
import ProjectDeliverablesView from './ProjectDeliverablesView';
import ProjectDocumentsView from './ProjectDocumentsView';
import ProjectProfileView from './ProjectProfileView';
import ProjectVariablesView from './ProjectVariablesView';
import PublishModal from './Reports/PublishModal';
import { useVotingData } from './Voting/VotingContext';

const ProjectPage = () => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { isAllowed } = useUser();
  const projectData = useAcceleratorProjectData();
  const { goToAcceleratorActivityCreate, goToDocumentNew, goToAcceleratorProjectEdit } = useNavigateTo();
  const { getApplicationByProjectId } = useApplicationData();
  const { projectScore } = useProjectScore(projectData.projectId);
  const { phaseVotes } = useVotingData();
  const dispatch = useAppDispatch();
  const query = useQuery();
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [publishRequestId, setPublishRequestId] = useState('');
  const publishProfileResponse = useAppSelector(selectPublishFunderProject(publishRequestId));
  const snackbar = useSnackbar();
  const { isDesktop, isMobile } = useDeviceInfo();

  const isAllowedEdit = isAllowed('UPDATE_ACCELERATOR_PROJECT');
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

  const reportsResponse = useListPublishedReportsQuery(projectData.projectId);
  const publishedReports = useMemo(() => reportsResponse.data?.reports ?? [], [reportsResponse.data?.reports]);

  const tabs = useMemo(() => {
    return [
      {
        id: 'projectProfile',
        label: strings.PROJECT_PROFILE,
        children: (
          <ProjectProfileView
            {...projectData}
            projectDetails={projectData.acceleratorProject}
            projectApplication={projectApplication}
            projectScore={projectScore}
            phaseVotes={phaseVotes}
            publishedReports={publishedReports || []}
          />
        ),
      },
      {
        id: 'activityLog',
        label: strings.PROJECT_ACTIVITY,
        children: (
          <ProjectActivityLogView
            highlightsModalOpen={highlightsModalOpen}
            projectDealName={projectData.acceleratorProject?.dealName}
            projectId={projectData.projectId}
            setHighlightsModalOpen={setHighlightsModalOpen}
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
  }, [strings, projectData, projectApplication, projectScore, phaseVotes, publishedReports, highlightsModalOpen]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'projectProfile',
    tabs,
    viewIdentifier: 'project-profile',
  });

  const isDataReady = useMemo(() => {
    const reportsReady = publishedReports !== undefined;

    let activeTabReady = false;
    if (activeTab === 'projectProfile') {
      activeTabReady = reportsReady;
    } else {
      activeTabReady = true;
    }

    return activeTabReady;
  }, [activeTab, publishedReports]);

  const goToProjectEdit = useCallback(
    () => goToAcceleratorProjectEdit(projectData.projectId),
    [goToAcceleratorProjectEdit, projectData.projectId]
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
      ...projectData.acceleratorProject,
      projectId: projectData.projectId,
      carbonCertifications: projectData.acceleratorProject?.carbonCertifications || [],
      landUseModelTypes: projectData.acceleratorProject?.landUseModelTypes || [],
      landUseModelHectares: projectData.acceleratorProject?.landUseModelHectares || {},
      metricProgress: projectData.acceleratorProject?.metricProgress ?? [],
      sdgList: projectData.acceleratorProject?.sdgList || [],
    };
    const request = dispatch(requestPublishFunderProject(funderProjectDetails));
    setPublishRequestId(request.requestId);
  }, [dispatch, projectData.acceleratorProject, projectData.projectId]);

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
  }, [closePublishDialog, snackbar, publishProfileResponse, strings.PROJECT_PROFILE_PUBLISHED]);

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

          {activeTab === 'activityLog' && !activityId && (
            <Box
              alignItems='center'
              display='flex'
              flexDirection='row'
              flexWrap={isMobile ? 'wrap' : 'nowrap'}
              justifyContent={isDesktop ? 'flex-end' : 'flex-start'}
            >
              {isAllowedCreateActivities && (
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
              )}
              <Button
                id='previewHighlights'
                label={strings.PREVIEW_HIGHLIGHTS}
                onClick={openActivityHighlightsPreview}
                priority='secondary'
                size='medium'
                sx={{ minWidth: '180px', whiteSpace: 'nowrap' }}
                type='productive'
              />
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
      isAllowedCreateActivities,
      isAllowedEdit,
      isAllowedPublish,
      isDesktop,
      isMobile,
      onOptionItemClick,
      openActivityHighlightsPreview,
      strings,
      theme,
    ]
  );

  const projectViewTitle = (
    <Box paddingLeft={1}>
      <Typography fontSize={'14px'} color={theme.palette.TwClrTxtSecondary}>
        {projectData.organization?.name?.toUpperCase()}
      </Typography>
      <Typography fontSize={'24px'} fontWeight={600}>
        {projectData.acceleratorProject?.dealName}
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
        {projectData.isLoading && <BusySpinner />}

        {!isDataReady && (
          <Box display='flex' justifyContent='center' padding={4}>
            <CircularProgress />
          </Box>
        )}
        {isDataReady && <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />}
      </Page>
    </>
  );
};

export default ProjectPage;
