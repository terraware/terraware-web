import React, { useMemo } from 'react';

import { DateTime } from 'luxon';

import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';

const CurrentModule = () => {
  const { activeModules, currentDeliverables, currentParticipantProject } = useParticipantData();
  const { goToDeliverable, goToModuleEventSession } = useNavigateTo();
  const { activeLocale } = useLocalization();

  // Only first active modules shown for now. TODO: upgrade to support multiple active modules for overlapping modules
  const currentModule = useMemo(
    () => (activeModules && activeModules.length > 0 ? activeModules[0] : null),
    [activeModules]
  );

  const deliverableDetails = useMemo(
    () =>
      currentParticipantProject
        ? (currentDeliverables || []).map((deliverable) => ({
            ...deliverable,
            dueDate: deliverable.dueDate ? DateTime.fromISO(deliverable.dueDate) : undefined,
            onClick: () => goToDeliverable(deliverable.id, currentParticipantProject.id),
          }))
        : [],
    [currentDeliverables, goToDeliverable, currentParticipantProject]
  );

  const eventDetails = useMemo(
    () =>
      currentModule && currentParticipantProject
        ? currentModule.events
            .flatMap((event) => event.sessions)
            .map((event) => ({
              ...event,
              onClick: () => goToModuleEventSession(currentParticipantProject.id, currentModule.id, event.id),
            }))
        : [],
    [currentModule, goToModuleEventSession, currentParticipantProject]
  );

  const moduleDetails = useMemo(
    () =>
      currentModule && currentParticipantProject
        ? {
            ...currentModule,
            title: activeLocale ? strings.formatString(strings.TITLE_OVERVIEW, currentModule.title).toString() : '',
          }
        : null,
    [activeLocale, currentModule]
  );

  if (!currentParticipantProject || !moduleDetails) {
    return null;
  }

  return (
    <ModuleDetailsCard
      deliverables={deliverableDetails}
      events={eventDetails}
      module={moduleDetails}
      projectId={currentParticipantProject.id}
    />
  );
};

export default CurrentModule;
