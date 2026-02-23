import React, { useEffect, useMemo } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { DateTime } from 'luxon';

import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import useGetProjectModule from 'src/hooks/useGetProjectModule';
import useListProjectModules from 'src/hooks/useListProjectModules';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectModuleDeliverables from 'src/hooks/useProjectModuleDeliverables';
import useProjectModuleEvents from 'src/hooks/useProjectModuleEvents';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

type ModuleDetailsCardWrapperProps = {
  moduleId: number;
  project: Project;
};

const ModuleDetailsCardWrapper = ({ moduleId, project }: ModuleDetailsCardWrapperProps) => {
  const { activeLocale } = useLocalization();
  const { goToDeliverable, goToModuleEventSession } = useNavigateTo();

  const { getProjectModule, projectModule } = useGetProjectModule();
  const { deliverables, listProjectModuleDeliverables } = useProjectModuleDeliverables();
  const { events, listProjectModuleEvents } = useProjectModuleEvents();
  const mixpanel = useMixpanel();

  useEffect(() => {
    if (project.id) {
      void getProjectModule({ moduleId, projectId: project.id });
      void listProjectModuleDeliverables({ moduleId, projectId: project.id });
      void listProjectModuleEvents({ moduleId, projectId: project.id });
    }
  }, [moduleId, project, getProjectModule, listProjectModuleDeliverables, listProjectModuleEvents]);

  const deliverableDetails = useMemo(
    () =>
      deliverables?.map((deliverable) => ({
        ...deliverable,
        dueDate: deliverable.dueDate ? DateTime.fromISO(deliverable.dueDate) : undefined,
        onClick: () => goToDeliverable(deliverable.id, project.id),
      })),
    [deliverables, goToDeliverable, project]
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
          goToModuleEventSession(project.id, moduleId, event.id);
        },
      })),
    [events, goToModuleEventSession, project, moduleId, mixpanel]
  );

  const moduleDetails = useMemo(
    () =>
      projectModule
        ? {
            ...projectModule,
            title: activeLocale ? strings.formatString(strings.TITLE_OVERVIEW, projectModule.title).toString() : '',
          }
        : undefined,
    [activeLocale, projectModule]
  );

  if (!moduleDetails) {
    return;
  }

  return (
    <ModuleDetailsCard
      deliverables={deliverableDetails ?? []}
      events={eventDetails ?? []}
      module={moduleDetails}
      projectId={project.id}
    />
  );
};

const CurrentModule = () => {
  const { currentAcceleratorProject } = useParticipantData();

  const { projectModules, listProjectModules } = useListProjectModules();

  useEffect(() => {
    if (currentAcceleratorProject && currentAcceleratorProject.id) {
      void listProjectModules(currentAcceleratorProject.id);
    }
  }, [currentAcceleratorProject, listProjectModules]);

  // Only first active modules shown for now. TODO: upgrade to support multiple active modules for overlapping modules
  const activeModules = useMemo(() => {
    if (!projectModules) {
      return;
    }

    return projectModules.filter((module) => module.isActive);
  }, [projectModules]);

  if (!currentAcceleratorProject || !activeModules) {
    return null;
  }

  return (
    <>
      {activeModules.map((module) => (
        <ModuleDetailsCardWrapper moduleId={module.id} project={currentAcceleratorProject} key={module.id} />
      ))}
    </>
  );
};

export default CurrentModule;
