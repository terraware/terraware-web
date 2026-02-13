import React from 'react';

import { PageProps } from 'src/components/Page';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

// This injects ModuleTimelineProps from ParticipantProvider
const ParticipantPage = (props: PageProps) => {
  const { currentParticipantProject, modules } = useParticipantData();

  return (
    <PageWithModuleTimeline {...props} projectPhase={currentParticipantProject?.phase} modules={modules ?? []}>
      {props.children}
    </PageWithModuleTimeline>
  );
};

export default ParticipantPage;
