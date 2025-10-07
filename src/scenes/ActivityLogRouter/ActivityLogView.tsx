import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import ActivitiesListView from 'src/components/ActivityLog/ActivitiesListView';
import Page from 'src/components/Page';
import PageHeaderProjectFilter from 'src/components/PageHeader/PageHeaderProjectFilter';
import Card from 'src/components/common/Card';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipantProjects } from 'src/hooks/useParticipantProjects';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import useQuery from 'src/utils/useQuery';

export default function ActivityLogView(): JSX.Element {
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const query = useQuery();
  const { goToAcceleratorActivityCreate, goToAcceleratorActivityEdit, goToActivityCreate, goToActivityEdit } =
    useNavigateTo();
  const { currentParticipantProject, allParticipantProjects, setCurrentParticipantProject } = useParticipantData();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { participantProjects, isLoading: participantProjectsLoading } = useParticipantProjects();

  const [activityId, setActivityId] = useState<number>();

  const organization = useMemo(
    () => (isAcceleratorRoute ? undefined : selectedOrganization),
    [isAcceleratorRoute, selectedOrganization]
  );

  const isAllowedCreateActivities = isAllowed('CREATE_ACTIVITIES', { organization });

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({});

  const projectId = useMemo(
    () => (projectFilter.projectId ? Number(projectFilter.projectId) : undefined),
    [projectFilter.projectId]
  );

  const availableProjects = useMemo(() => {
    return participantProjects
      .map((project) => ({
        dealName: project.dealName,
        id: project.projectId,
        name: project.dealName || '',
        organizationId: -1,
      }))
      .filter((project) => project.dealName)
      .sort((a, b) => a.dealName!.localeCompare(b.dealName!, activeLocale || undefined));
  }, [activeLocale, participantProjects]);

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

  const goToProjectActivityEdit = useCallback(() => {
    if (!projectId || !activityId) {
      return;
    }

    if (isAcceleratorRoute) {
      goToAcceleratorActivityEdit(projectId, activityId);
    } else {
      goToActivityEdit(projectId, activityId);
    }
  }, [goToAcceleratorActivityEdit, goToActivityEdit, isAcceleratorRoute, projectId, activityId]);

  useEffect(() => {
    const _activityId = query.get('activityId');
    setActivityId(_activityId ? Number(_activityId) : undefined);
  }, [query]);

  const PageHeaderLeftComponent = useMemo(
    () => (
      <PageHeaderProjectFilter
        currentParticipantProject={currentParticipantProject}
        projectFilter={projectFilter}
        projects={isAcceleratorRoute ? availableProjects : allParticipantProjects}
        setCurrentParticipantProject={setCurrentParticipantProject}
        setProjectFilter={setProjectFilter}
      />
    ),
    [
      allParticipantProjects,
      availableProjects,
      currentParticipantProject,
      isAcceleratorRoute,
      projectFilter,
      setCurrentParticipantProject,
    ]
  );

  const PageHeaderRightComponent = useMemo(
    () =>
      activityId ? (
        <Button
          disabled={!projectId}
          icon='iconEdit'
          label={strings.EDIT_ACTIVITY}
          onClick={goToProjectActivityEdit}
          size='medium'
        />
      ) : isAllowedCreateActivities ? (
        <Button
          disabled={!projectId}
          icon='plus'
          label={strings.ADD_ACTIVITY}
          onClick={goToProjectActivityCreate}
          size='medium'
        />
      ) : null,
    [goToProjectActivityCreate, goToProjectActivityEdit, isAllowedCreateActivities, projectId, activityId, strings]
  );

  return (
    <Page
      hierarchicalCrumbs={false}
      isLoading={isAcceleratorRoute && participantProjectsLoading}
      leftComponent={PageHeaderLeftComponent}
      rightComponent={PageHeaderRightComponent}
      title={strings.ACTIVITY_LOG}
    >
      <Card
        style={{
          borderRadius: theme.spacing(1),
          padding: theme.spacing(3),
          width: '100%',
        }}
      >
        {projectId && <ActivitiesListView projectId={projectId} />}
      </Card>
    </Page>
  );
}
