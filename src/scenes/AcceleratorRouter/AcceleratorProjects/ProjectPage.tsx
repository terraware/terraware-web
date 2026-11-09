import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, Dropdown, DropdownItem, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import ActivityHighlightsContent, { QuarterDropdownData } from 'src/components/ActivityLog/ActivityHighlightsContent';
import { TypedActivity } from 'src/components/ActivityLog/types';
import Page from 'src/components/Page';
import OptionsMenu from 'src/components/common/OptionsMenu';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectScore from 'src/hooks/useProjectScore';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useVotingData from 'src/hooks/useVotingData';
import { useLocalization, useUser } from 'src/providers';
import { useAdminListActivitiesQuery } from 'src/queries/generated/activities';
import { useListApplicationsQuery } from 'src/queries/generated/applications';
import { usePublishProjectProfileMutation } from 'src/queries/generated/funderProjects';
import { useListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import PlantsDashboardView from 'src/scenes/PlantsDashboardRouter/PlantsDashboardView';
import { FunderProjectDetails } from 'src/types/FunderProject';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useStickyTabs from 'src/utils/useStickyTabs';

import { useAcceleratorProjectData } from './AcceleratorProjectContext';
import ProjectActivityLogView from './ProjectActivityLogView';
import ProjectProfileView from './ProjectProfileView';
import PublishModal from './Reports/PublishModal';
import ReportActions from './Reports/ReportActions';
import ReportsContent, { ReportsSegment } from './Reports/ReportsContent';
import useResolvedReportId from './Reports/useResolvedReportId';

const ProjectPage = () => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { isAllowed } = useUser();
  const projectData = useAcceleratorProjectData();
  const { goToAcceleratorActivityCreate, goToAcceleratorProjectEdit } = useNavigateTo();
  const { projectScore } = useProjectScore(projectData.projectId);
  const { phaseVotes } = useVotingData();
  const query = useQuery();
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [publishProjectProfile] = usePublishProjectProfileMutation();
  const snackbar = useSnackbar();
  const { isDesktop, isMobile } = useDeviceInfo();
  const location = useStateLocation();
  const navigate = useSyncNavigate();

  const setQueryParam = useCallback(
    (key: string, value: string, replace = false) => {
      const params = new URLSearchParams(location.search);
      params.set(key, value);
      navigate(getLocation(location.pathname, location, `?${params.toString()}`), { replace });
    },
    [location, navigate]
  );

  const selectedReportId = useMemo(() => {
    const reportId = query.get('reportId');
    return reportId ? Number(reportId) : undefined;
  }, [query]);

  const resolvedReportId = useResolvedReportId(projectData.projectId, selectedReportId);

  const onSelectReport = useCallback(
    (reportId: number, replace = false) => setQueryParam('reportId', `${reportId}`, replace),
    [setQueryParam]
  );

  const reportsSegment = useMemo((): ReportsSegment => {
    const segment = query.get('reportsSegment');
    return segment === 'targets' || segment === 'indicators' ? segment : 'reports';
  }, [query]);

  const onChangeReportsSegment = useCallback(
    (segment: ReportsSegment) => setQueryParam('reportsSegment', segment, true),
    [setQueryParam]
  );

  const isAllowedEdit = isAllowed('UPDATE_ACCELERATOR_PROJECT');
  const isAllowedPublish = isAllowed('PUBLISH_PROJECT_DETAILS');
  const isAllowedCreateActivities = isAllowed('CREATE_ACTIVITIES');

  const activityId = useMemo(() => {
    const _activityId = query.get('activityId');
    return _activityId ? Number(_activityId) : undefined;
  }, [query]);
  const [quarterDropdownData, setQuarterDropdownData] = useState<QuarterDropdownData | undefined>(undefined);

  const { currentData: projectApplicationsData } = useListApplicationsQuery({ projectId: projectData.projectId });
  const projectApplication = projectApplicationsData?.applications[0];

  const reportsResponse = useListPublishedReportsQuery(projectData.projectId);
  const publishedReports = useMemo(() => reportsResponse.data?.reports ?? [], [reportsResponse.data?.reports]);

  const {
    currentData: activitiesData,
    isError: activitiesError,
    isFetching: activitiesFetching,
  } = useAdminListActivitiesQuery({ projectId: projectData.projectId, depth: 'All' });
  const activities = useMemo<TypedActivity[]>(
    () => activitiesData?.activities?.map((payload) => ({ type: 'admin' as const, payload })) ?? [],
    [activitiesData]
  );

  const tabs = useMemo(() => {
    const profileTab = {
      id: 'projectProfile',
      label: strings.PROFILE,
      children: (
        <ProjectProfileView
          {...projectData}
          projectDetails={projectData.acceleratorProject}
          projectApplication={projectApplication}
          projectScore={projectScore}
          phaseVotes={phaseVotes}
          publishedReports={publishedReports || []}
          reportsPath={`${location.pathname}?tab=reports`}
        />
      ),
    };

    const activityTab = {
      id: 'activityLog',
      label: strings.ACTIVITY,
      children: (
        <ProjectActivityLogView
          projectDealName={projectData.acceleratorProject?.dealName}
          projectId={projectData.projectId}
        />
      ),
    };

    const plantsDashboardTab = {
      id: 'plantsDashboard',
      label: strings.PLANTS_DASHBOARD,
      children: (
        <PlantsDashboardView
          projectId={projectData.projectId}
          organizationId={projectData?.project?.organizationId || projectApplication?.organizationId}
        />
      ),
    };

    return [
      profileTab,
      {
        id: 'reports',
        label: strings.REPORTS,
        children: (
          <ReportsContent
            onChangeSegment={onChangeReportsSegment}
            onSelectReport={onSelectReport}
            segment={reportsSegment}
            selectedReportId={selectedReportId}
          />
        ),
      },
      activityTab,
      {
        id: 'quarterlyHighlights',
        label: strings.QUARTERLY_HIGHLIGHTS,
        children: (
          <ActivityHighlightsContent
            activities={activities}
            busy={activitiesFetching}
            fitToWindow
            onDropdownDataReady={setQuarterDropdownData}
            projectId={projectData.projectId}
            showDropdownInline={false}
          />
        ),
      },
      plantsDashboardTab,
    ];
  }, [
    activities,
    activitiesFetching,
    location.pathname,
    onChangeReportsSegment,
    onSelectReport,
    phaseVotes,
    projectApplication,
    projectData,
    projectScore,
    publishedReports,
    reportsSegment,
    selectedReportId,
    strings,
  ]);

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

  const openActivityHighlightsPreview = useCallback(() => onChangeTab('quarterlyHighlights'), [onChangeTab]);

  const closePublishDialog = useCallback(() => setOpenPublishDialog(false), []);

  const publishProfile = useCallback(() => {
    const funderProjectDetails: FunderProjectDetails = {
      ...projectData.acceleratorProject,
      projectId: projectData.projectId,
      carbonCertifications: projectData.acceleratorProject?.carbonCertifications || [],
      landUseModelTypes: projectData.acceleratorProject?.landUseModelTypes || [],
      landUseModelHectares: projectData.acceleratorProject?.landUseModelHectares || {},
      indicatorProgress: projectData.acceleratorProject?.indicatorProgress ?? [],
      sdgList: projectData.acceleratorProject?.sdgList || [],
    };
    void publishProjectProfile({
      projectId: projectData.projectId,
      publishProjectProfileRequestPayload: { details: funderProjectDetails },
    })
      .unwrap()
      .then(() => {
        snackbar.toastSuccess(strings.PROJECT_PROFILE_PUBLISHED);
        closePublishDialog();
      })
      .catch(() => snackbar.toastError());
  }, [
    closePublishDialog,
    projectData.acceleratorProject,
    projectData.projectId,
    publishProjectProfile,
    snackbar,
    strings.PROJECT_PROFILE_PUBLISHED,
  ]);

  const onOptionItemClick = useCallback((optionItem: DropdownItem) => {
    if (optionItem.value === 'publish') {
      setOpenPublishDialog(true);
    }
  }, []);

  useEffect(() => {
    if (activitiesError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [activitiesError, snackbar, strings.GENERIC_ERROR]);

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

          {activeTab === 'reports' && reportsSegment === 'reports' && resolvedReportId !== undefined && (
            <ReportActions projectId={projectData.projectId} reportId={resolvedReportId} />
          )}

          {activeTab === 'quarterlyHighlights' &&
            quarterDropdownData &&
            quarterDropdownData.dropdownOptions.length > 0 && (
              <Dropdown
                label=''
                onChange={quarterDropdownData.onChangeQuarter}
                options={quarterDropdownData.dropdownOptions}
                selectedValue={quarterDropdownData.selectedQuarter}
              />
            )}
        </Box>
      </Box>
    ),
    [
      activeTab,
      activityId,
      goToProjectActivityCreate,
      goToProjectEdit,
      isAllowedCreateActivities,
      isAllowedEdit,
      isAllowedPublish,
      isDesktop,
      isMobile,
      onOptionItemClick,
      openActivityHighlightsPreview,
      projectData.projectId,
      quarterDropdownData,
      reportsSegment,
      resolvedReportId,
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
        leftComponentGridSize={0}
        rightComponent={rightComponent}
        rightComponentGridSize={6}
        stickyHeader
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
