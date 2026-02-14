import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button, Message } from '@terraware/web-components';
import { DateTime } from 'luxon';

import ActivitiesListView from 'src/components/ActivityLog/ActivitiesListView';
import { TypedActivity } from 'src/components/ActivityLog/types';
import Page from 'src/components/Page';
import PageHeaderProjectFilter from 'src/components/PageHeader/PageHeaderProjectFilter';
import Card from 'src/components/common/Card';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useAcceleratorProjects } from 'src/hooks/useAcceleratorProjects';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';

export default function ActivityLogView(): JSX.Element {
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const query = useQuery();
  const { isDesktop, isMobile } = useDeviceInfo();
  const { goToAcceleratorActivityCreate, goToActivityCreate } = useNavigateTo();
  const { currentAcceleratorProject, allAcceleratorProjects, setCurrentAcceleratorProject } = useParticipantData();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { acceleratorProjects, isLoading: participantProjectsLoading } = useAcceleratorProjects();

  const [activityId, setActivityId] = useState<number>();
  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({});
  const [highlightsModalOpen, setHighlightsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<TypedActivity>();

  const organization = useMemo(
    () => (isAcceleratorRoute ? undefined : selectedOrganization),
    [isAcceleratorRoute, selectedOrganization]
  );

  const isAllowedCreateActivities = isAllowed('CREATE_ACTIVITIES', { organization });

  const projectId = useMemo(
    () => (projectFilter.projectId ? Number(projectFilter.projectId) : undefined),
    [projectFilter.projectId]
  );

  const availableProjects = useMemo(() => {
    return acceleratorProjects
      .map((project) => ({
        dealName: project.dealName,
        id: project.projectId,
        name: project.dealName || '',
        organizationId: -1,
      }))
      .filter((project) => project.dealName)
      .sort((a, b) => a.dealName!.localeCompare(b.dealName!, activeLocale || undefined));
  }, [activeLocale, acceleratorProjects]);

  const projectDealName = useMemo(() => {
    const project = availableProjects.find((p) => p.id === projectId);
    return project?.dealName || '';
  }, [availableProjects, projectId]);

  const goToProjectActivityCreate = useCallback(() => {
    if (!projectId) {
      return;
    }

    if (isAcceleratorRoute) {
      goToAcceleratorActivityCreate(projectId);
    } else {
      goToActivityCreate(projectId);
    }
  }, [goToAcceleratorActivityCreate, goToActivityCreate, isAcceleratorRoute, projectId]);

  const openActivityHighlightsPreview = useCallback(() => {
    setHighlightsModalOpen(true);
  }, []);

  useEffect(() => {
    const _activityId = query.get('activityId');
    setActivityId(_activityId ? Number(_activityId) : undefined);
  }, [query]);

  const PageHeaderLeftComponent = useMemo(
    () => (
      <PageHeaderProjectFilter
        currentAcceleratorProject={currentAcceleratorProject}
        projectFilter={projectFilter}
        projects={isAcceleratorRoute ? availableProjects : allAcceleratorProjects}
        setCurrentAcceleratorProject={setCurrentAcceleratorProject}
        setProjectFilter={setProjectFilter}
      />
    ),
    [
      allAcceleratorProjects,
      availableProjects,
      currentAcceleratorProject,
      isAcceleratorRoute,
      projectFilter,
      setCurrentAcceleratorProject,
    ]
  );

  const PageHeaderRightComponent = useMemo(
    () =>
      isAllowedCreateActivities && !activityId ? (
        <Box
          alignItems='center'
          display='flex'
          flexDirection='row'
          flexWrap={isMobile ? 'wrap' : 'nowrap'}
          justifyContent={isDesktop ? 'flex-end' : 'flex-start'}
        >
          <Button
            disabled={!projectId}
            icon='plus'
            label={strings.ADD_ACTIVITY}
            onClick={goToProjectActivityCreate}
            size='medium'
            sx={{ minWidth: '160px', whiteSpace: 'nowrap' }}
          />
          {isAcceleratorRoute && (
            <Button
              disabled={!projectId}
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
      ) : null,
    [
      activityId,
      goToProjectActivityCreate,
      isAcceleratorRoute,
      isAllowedCreateActivities,
      isDesktop,
      isMobile,
      openActivityHighlightsPreview,
      projectId,
      strings.ADD_ACTIVITY,
      strings.PREVIEW_HIGHLIGHTS,
    ]
  );

  return (
    <>
      <Page
        hierarchicalCrumbs={false}
        isLoading={isAcceleratorRoute && participantProjectsLoading}
        leftComponent={PageHeaderLeftComponent}
        rightComponent={PageHeaderRightComponent}
        title={strings.ACTIVITY_LOG}
        titleContainerStyle={{ minHeight: '56px' }}
      >
        {isAcceleratorRoute &&
          activityId &&
          selectedActivity &&
          selectedActivity.type === 'admin' &&
          selectedActivity.payload.verifiedBy &&
          ((selectedActivity.payload.modifiedTime &&
            selectedActivity.payload.publishedTime &&
            selectedActivity.payload.modifiedTime > selectedActivity.payload.publishedTime) ||
            (selectedActivity.payload.modifiedTime && !selectedActivity.payload.publishedTime)) && (
            <Box marginBottom={theme.spacing(3)} width={'100%'}>
              <Message
                type='page'
                priority={'info'}
                title={strings.YOU_HAVE_UNPUBLISHED_CHANGES}
                body={strings.formatString(
                  strings.LAST_CHANGES_MADE_ON,
                  DateTime.fromISO(selectedActivity.payload.modifiedTime).toFormat('yyyy/MM/dd')
                )}
              />
            </Box>
          )}
        <Card
          style={{
            borderRadius: theme.spacing(1),
            padding: theme.spacing(3),
            width: '100%',
          }}
        >
          {projectId && (
            <ActivitiesListView
              highlightsModalOpen={highlightsModalOpen}
              projectDealName={projectDealName}
              projectId={projectId}
              setHighlightsModalOpen={setHighlightsModalOpen}
              setSelectedActivity={setSelectedActivity}
            />
          )}
        </Card>
      </Page>
    </>
  );
}
