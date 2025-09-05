import React, { useMemo, useState } from 'react';

import Page from 'src/components/Page';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

import PageHeaderProjectFilter from './PageHeaderProjectFilter';

export default function ActivityLogView(): JSX.Element {
  const { strings } = useLocalization();
  const { currentParticipantProject, allParticipantProjects, setCurrentParticipantProject } = useParticipantData();

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({});

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

  return (
    <Page hierarchicalCrumbs={false} leftComponent={PageHeaderLeftComponent} title={strings.ACTIVITY_LOG}>
      <p>Content here</p>
    </Page>
  );
}
