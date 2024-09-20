import React, { useEffect, useMemo } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { DateTime } from 'luxon';

import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import useGetModule from 'src/hooks/useGetModule';
import useListModules from 'src/hooks/useListModules';
import useNavigateTo from 'src/hooks/useNavigateTo';
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

  const { getModule, module, deliverables, events } = useGetModule();
  const mixpanel = useMixpanel();

  useEffect(() => {
    void getModule({ moduleId, projectId: project.id });
  }, [moduleId, project, getModule]);

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
    [events, goToModuleEventSession, project, moduleId]
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
  const { currentParticipantProject } = useParticipantData();

  const { modules, listModules } = useListModules();

  useEffect(() => {
    if (currentParticipantProject) {
      void listModules({ projectId: currentParticipantProject.id });
    }
  }, [currentParticipantProject, listModules]);

  // Only first active modules shown for now. TODO: upgrade to support multiple active modules for overlapping modules
  const activeModules = useMemo(() => {
    if (!modules) {
      return;
    }

    return modules.filter((module) => module.isActive);
  }, [modules]);

  if (!currentParticipantProject || !activeModules) {
    return null;
  }

  return (
    <>
      {activeModules.map((module) => (
        <ModuleDetailsCardWrapper moduleId={module.id} project={currentParticipantProject} key={module.id} />
      ))}
    </>
  );
};

export default CurrentModule;
