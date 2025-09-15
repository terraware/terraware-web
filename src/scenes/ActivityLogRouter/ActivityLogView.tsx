import React, { useCallback, useMemo, useState } from 'react';

import { useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import ActivitiesListView from 'src/components/ActivityLog/ActivitiesListView';
import Page from 'src/components/Page';
import PageHeaderProjectFilter from 'src/components/PageHeader/PageHeaderProjectFilter';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

export default function ActivityLogView(): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { currentParticipantProject, allParticipantProjects, setCurrentParticipantProject } = useParticipantData();

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({});

  const activityCreateLocation = useMemo(
    () => ({
      pathname: APP_PATHS.ACTIVITY_LOG_NEW.replace(
        ':projectId',
        projectFilter.projectId ? String(projectFilter.projectId) : ''
      ),
    }),
    [projectFilter]
  );

  const goToActivityCreate = useCallback(() => {
    navigate(activityCreateLocation);
  }, [navigate, activityCreateLocation]);

  const PageHeaderLeftComponent = useMemo(
    () => (
      <PageHeaderProjectFilter
        allParticipantProjects={allParticipantProjects}
        currentParticipantProject={currentParticipantProject}
        projectFilter={projectFilter}
        setCurrentParticipantProject={setCurrentParticipantProject}
        setProjectFilter={setProjectFilter}
      />
    ),
    [allParticipantProjects, currentParticipantProject, projectFilter, setCurrentParticipantProject, setProjectFilter]
  );

  const PageHeaderRightComponent = useMemo(
    () => (
      <Button
        disabled={!projectFilter.projectId}
        icon='plus'
        label={strings.ADD_ACTIVITY}
        onClick={goToActivityCreate}
        size='medium'
      />
    ),
    [goToActivityCreate, projectFilter.projectId, strings]
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
        {projectFilter.projectId && <ActivitiesListView projectId={Number(projectFilter.projectId)} />}
      </Card>
    </Page>
  );
}
