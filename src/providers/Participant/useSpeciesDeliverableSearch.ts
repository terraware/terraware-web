import { useCallback, useEffect, useMemo, useState } from 'react';

import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { requestListModuleDeliverables } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleDeliverables } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { DeliverableTypeType } from 'src/types/Deliverables';
import { ModuleDeliverable } from 'src/types/Module';

interface DeliverableSearch {
  deliverableSearchResults: ModuleDeliverable[] | undefined;
  hasActiveDeliverable: boolean;
  hasRecentDeliverable: boolean;
  isLoading: boolean;
  reload: () => void;
}

/**
 * This hook only works within the ParticipantProvider
 * Encapsulated deliverable search based on current participant project, and modules available to them, for retrieving the
 * active or most recent species deliverable
 * @param param0
 * @returns
 */
export const useSpeciesDeliverableSearch = (): DeliverableSearch => {
  const dispatch = useAppDispatch();
  const {
    currentDeliverables,
    currentParticipantProject,
    isLoading: isParticipantDataLoading,
    modules,
  } = useParticipantData();

  const [deliverableSearchRequestId, setDeliverableSearchRequestId] = useState('');
  const deliverableSearchRequest = useAppSelector(selectModuleDeliverables(deliverableSearchRequestId));

  const hasActiveDeliverable = useMemo(
    () => !!(currentDeliverables || []).find((deliverable) => deliverable.type === 'Species'),
    [currentDeliverables]
  );

  const hasRecentDeliverable = useMemo(
    () => deliverableSearchRequest?.status === 'success' && (deliverableSearchRequest?.data || []).length > 0,
    [deliverableSearchRequest]
  );

  const reload = useCallback(() => {
    const _modules = modules || [];

    if (
      isParticipantDataLoading ||
      !currentParticipantProject ||
      // We need to know the modules available to the participant before we
      // can search for associated deliverables
      _modules.length === 0 ||
      // If there is an active species list deliverable, we don't need to find the most recent one
      hasActiveDeliverable
    ) {
      return;
    }

    const deliverableRequest = dispatch(
      requestListModuleDeliverables({
        projectIds: [currentParticipantProject.id],
        moduleIds: _modules.map((module) => module.id),
        searchChildren: [
          {
            operation: 'field',
            field: 'type(raw)',
            type: 'Exact',
            values: ['Species' as DeliverableTypeType],
          },
        ],
      })
    );
    setDeliverableSearchRequestId(deliverableRequest.requestId);
  }, [currentParticipantProject, isParticipantDataLoading, hasActiveDeliverable, modules]);

  // Initialize the hook
  useEffect(() => {
    reload();
  }, [reload]);

  return useMemo<DeliverableSearch>(
    () => ({
      deliverableSearchResults: deliverableSearchRequest.data,
      hasActiveDeliverable,
      hasRecentDeliverable,
      isLoading: deliverableSearchRequest.status === 'pending' || isParticipantDataLoading,
      reload,
    }),
    [deliverableSearchRequest, hasActiveDeliverable, hasRecentDeliverable, reload]
  );
};
