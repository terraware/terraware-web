import { useCallback, useMemo } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';

import useDeliverablesWithOverdue from 'src/hooks/useDeliverablesWithOverdue';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';

interface DeliverableSearch {
  deliverableSearchResults: ListDeliverablesElementWithOverdue[] | undefined;
  hasActiveDeliverable: boolean;
  hasRecentDeliverable: boolean;
  isLoading: boolean;
  reload: () => void;
}

/**
 * This hook only works within the ParticipantProvider
 * Encapsulated deliverable search based on current accelerator project, and modules available to them, for retrieving the
 * active or most recent species deliverable
 * @param param0
 * @returns
 */
export const useSpeciesDeliverableSearch = (): DeliverableSearch => {
  const { currentAcceleratorProject, isLoading: isParticipantDataLoading, modules } = useParticipantData();

  // We need to know the modules available to the participant before we can search for associated deliverables
  const projectId = !isParticipantDataLoading && (modules ?? []).length > 0 ? currentAcceleratorProject?.id : undefined;
  const { deliverables, isFetching, refetch } = useDeliverablesWithOverdue(
    projectId !== undefined ? { projectId } : skipToken
  );

  const speciesDeliverables = useMemo(() => {
    const moduleIds = (modules ?? []).map((module) => module.id);
    return (deliverables ?? []).filter(
      (deliverable) => deliverable.type === 'Species' && moduleIds.includes(deliverable.moduleId)
    );
  }, [deliverables, modules]);

  const activeModules = useMemo(() => (modules ?? []).filter((module) => module.isActive), [modules]);

  const activeDeliverables = useMemo(
    () =>
      speciesDeliverables.filter(
        (deliverable) => activeModules.findIndex((module) => module.id === deliverable.moduleId) >= 0
      ),
    [speciesDeliverables, activeModules]
  );

  const reload = useCallback(() => {
    if (projectId !== undefined) {
      void refetch();
    }
  }, [projectId, refetch]);

  return useMemo<DeliverableSearch>(
    () => ({
      deliverableSearchResults: deliverables ? speciesDeliverables : undefined,
      hasActiveDeliverable: activeDeliverables.length > 0,
      hasRecentDeliverable: speciesDeliverables.length > 0,
      isLoading: isFetching || isParticipantDataLoading,
      reload,
    }),
    [deliverables, speciesDeliverables, activeDeliverables, isFetching, isParticipantDataLoading, reload]
  );
};
