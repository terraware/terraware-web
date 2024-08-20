import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { DateTime } from 'luxon';

import { Crumb } from 'src/components/BreadCrumbs';
import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import ModuleViewTitle from './ModuleViewTitle';
import { useModuleData } from './Provider/Context';

const ModuleView = () => {
  const { activeLocale } = useLocalization();
  const { goToDeliverable, goToModuleEventSession } = useNavigateTo();

  const pathParams = useParams<{ sessionId: string; moduleId: string; projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const { deliverables, module } = useModuleData();

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.ALL_MODULES : '',
        to: APP_PATHS.PROJECT_MODULES.replace(':projectId', `${projectId}`),
      },
    ],
    [activeLocale, projectId]
  );

  const deliverableDetails = useMemo(
    () =>
      deliverables.map((deliverable) => ({
        ...deliverable,
        dueDate: deliverable.dueDate ? DateTime.fromISO(deliverable.dueDate) : undefined,
        onClick: () => goToDeliverable(deliverable.id, projectId),
      })),
    [deliverables, goToDeliverable, projectId]
  );

  const eventDetails = useMemo(
    () =>
      module
        ? module.events
            .flatMap((event) => event.sessions)
            .map((event) => ({ ...event, onClick: () => goToModuleEventSession(projectId, module.id, event.id) }))
        : [],
    [module, goToModuleEventSession, projectId]
  );

  const moduleDetails = useMemo(
    () =>
      module
        ? {
            ...module,
            title: activeLocale && module ? strings.formatString(strings.TITLE_OVERVIEW, module.title).toString() : '',
          }
        : null,
    [activeLocale, module]
  );

  return (
    <PageWithModuleTimeline
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
    </PageWithModuleTimeline>
  );
};

export default ModuleView;
