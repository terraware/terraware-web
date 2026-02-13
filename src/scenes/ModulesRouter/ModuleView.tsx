import React, { useEffect, useMemo } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';
import { useParams } from 'react-router';

import { DateTime } from 'luxon';

import { Crumb } from 'src/components/BreadCrumbs';
import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import ParticipantPage from 'src/components/common/PageWithModuleTimeline/ParticipantPage';
import { APP_PATHS } from 'src/constants';
import useGetCohortModule from 'src/hooks/useGetCohortModule';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectModuleDeliverables from 'src/hooks/useProjectModuleDeliverables';
import useProjectModuleEvents from 'src/hooks/useProjectModuleEvents';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';

import ModuleViewTitle from './ModuleViewTitle';

const ModuleView = () => {
  const { activeLocale } = useLocalization();
  const { goToDeliverable, goToModuleEventSession } = useNavigateTo();
  const { currentAcceleratorProject, setCurrentAcceleratorProject } = useParticipantData();

  const pathParams = useParams<{ sessionId: string; moduleId: string; projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const moduleId = Number(pathParams.moduleId);
  const mixpanel = useMixpanel();

  useEffect(() => {
    if (projectId) {
      setCurrentAcceleratorProject(projectId);
    }
  }, [projectId, setCurrentAcceleratorProject]);

  const { cohortModule, getCohortModule } = useGetCohortModule();
  const { deliverables, listProjectModuleDeliverables } = useProjectModuleDeliverables();
  const { events, listProjectModuleEvents } = useProjectModuleEvents();

  useEffect(() => {
    if (currentAcceleratorProject && currentAcceleratorProject.cohortId) {
      void getCohortModule({ moduleId, cohortId: currentAcceleratorProject.cohortId });
      void listProjectModuleDeliverables({ moduleId, projectId: currentAcceleratorProject.id });
      void listProjectModuleEvents({ moduleId, projectId: currentAcceleratorProject.id });
    }
  }, [currentAcceleratorProject, moduleId, getCohortModule, listProjectModuleDeliverables, listProjectModuleEvents]);

  const deliverableDetails = useMemo(
    () =>
      deliverables?.map((deliverable) => ({
        ...deliverable,
        dueDate: deliverable.dueDate ? DateTime.fromISO(deliverable.dueDate) : undefined,
        onClick: () => goToDeliverable(deliverable.id, projectId),
      })),
    [deliverables, goToDeliverable, projectId]
  );

  const eventDetails = useMemo(
    () =>
      events?.map((event) => ({
        ...event,
        onClick: () => {
          mixpanel?.track(MIXPANEL_EVENTS.ACCELERATOR_MDDULE_SESSION_EVENT_LINK, {
            eventId: event.id,
            type: event.type,
          });
          goToModuleEventSession(projectId, moduleId, event.id);
        },
      })),
    [events, goToModuleEventSession, projectId, mixpanel, moduleId]
  );

  const moduleDetails = useMemo(
    () =>
      cohortModule
        ? {
            ...cohortModule,
            title: activeLocale ? strings.formatString(strings.TITLE_OVERVIEW, cohortModule.title).toString() : '',
          }
        : undefined,
    [activeLocale, cohortModule]
  );

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.ALL_MODULES : '',
        to: APP_PATHS.PROJECT_MODULES.replace(':projectId', `${projectId}`),
      },
    ],
    [activeLocale, projectId]
  );

  return (
    <ParticipantPage
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      title={<ModuleViewTitle module={cohortModule} projectId={projectId} />}
    >
      {moduleDetails && (
        <ModuleDetailsCard
          deliverables={deliverableDetails}
          events={eventDetails}
          module={moduleDetails}
          projectId={projectId}
        />
      )}
    </ParticipantPage>
  );
};

export default ModuleView;
