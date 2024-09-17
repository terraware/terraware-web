import React, { useEffect, useMemo } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';
import { useParams } from 'react-router-dom';

import { DateTime } from 'luxon';

import { Crumb } from 'src/components/BreadCrumbs';
import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import ParticipantPage from 'src/components/common/PageWithModuleTimeline/ParticipantPage';
import { APP_PATHS } from 'src/constants';
import useGetModule from 'src/hooks/useGetModule';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import ModuleViewTitle from './ModuleViewTitle';

const ModuleView = () => {
  const { activeLocale } = useLocalization();
  const { goToDeliverable, goToModuleEventSession } = useNavigateTo();

  const pathParams = useParams<{ sessionId: string; moduleId: string; projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const moduleId = Number(pathParams.moduleId);
  const mixpanel = useMixpanel();

  const { getModule, module, deliverables, events } = useGetModule();

  useEffect(() => {
    void getModule({ moduleId, projectId });
  }, [projectId, moduleId, getModule]);

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
    [events, goToModuleEventSession, projectId, module]
  );

  const moduleDetails = useMemo(
    () =>
      module
        ? {
            ...module,
            title: activeLocale ? strings.formatString(strings.TITLE_OVERVIEW, module.title).toString() : '',
          }
        : undefined,
    [activeLocale, module]
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
      title={<ModuleViewTitle module={module} projectId={projectId} />}
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
