import React, { useCallback, useMemo, useState } from 'react';

import { useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import ActivitiesListView from 'src/components/ActivityLog/ActivitiesListView';
import Page from 'src/components/Page';
import PageHeaderProjectFilter from 'src/components/PageHeader/PageHeaderProjectFilter';
import Card from 'src/components/common/Card';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipants } from 'src/hooks/useParticipants';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

export default function ActivityLogView(): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { goToAcceleratorActivityCreate, goToActivityCreate } = useNavigateTo();
  const { currentParticipantProject, allParticipantProjects, setCurrentParticipantProject } = useParticipantData();
  const { availableParticipants } = useParticipants();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({});

  const projectId = useMemo(
    () => (projectFilter.projectId ? Number(projectFilter.projectId) : undefined),
    [projectFilter.projectId]
  );

  const availableProjects = useMemo(() => {
    return availableParticipants
      .flatMap((participant) =>
        participant.projects.map((project) => ({
          dealName: project.projectDealName,
          id: project.projectId,
          name: project.projectName,
          organizationId: project.organizationId,
        }))
      )
      .filter((project) => project.dealName)
      .sort((a, b) => a.dealName!.localeCompare(b.dealName!));
  }, [availableParticipants]);

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
    () => (
      <Button
        disabled={!projectFilter.projectId}
        icon='plus'
        label={strings.ADD_ACTIVITY}
        onClick={goToProjectActivityCreate}
        size='medium'
      />
    ),
    [goToProjectActivityCreate, projectFilter.projectId, strings]
  );

  return (
    <Page
      hierarchicalCrumbs={false}
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
