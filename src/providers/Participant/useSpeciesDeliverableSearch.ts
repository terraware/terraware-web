import { useCallback, useEffect, useMemo, useState } from 'react';

import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { DeliverableTypeType, ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';

import { useLocalization } from '../hooks';

interface DeliverableSearch {
  deliverableSearchResults: ListDeliverablesElementWithOverdue[] | undefined;
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
  const { activeLocale } = useLocalization();

  const { currentAcceleratorProject, isLoading: isParticipantDataLoading, modules } = useParticipantData();

  const [recentDeliverableSearchRequestId, setRecentDeliverableSearchRequestId] = useState('');
  const recentDeliverablesSearchRequest = useAppSelector(
    selectDeliverablesSearchRequest(recentDeliverableSearchRequestId)
  );

  const activeModules = useMemo(() => (modules ?? []).filter((module) => module.isActive), [modules]);
  const speciesDeliverables = useMemo(() => {
    if (recentDeliverablesSearchRequest?.status === 'success') {
      return recentDeliverablesSearchRequest?.data || [];
    }
    return [];
  }, [recentDeliverablesSearchRequest]);

  const activeDeliverables = useMemo(
    () =>
      speciesDeliverables.filter(
        (deliverable) => activeModules.findIndex((module) => module.id === deliverable.moduleId) >= 0
      ),
    [speciesDeliverables, activeModules]
  );

  const reload = useCallback(() => {
    const _modules = modules || [];

    if (
      isParticipantDataLoading ||
      !currentAcceleratorProject ||
      // We need to know the modules available to the participant before we
      // can search for associated deliverables
      _modules.length === 0
    ) {
      return;
    }

    const deliverableRequest = dispatch(
      requestListDeliverables({
        locale: activeLocale,
        listRequest: {
          projectId: currentAcceleratorProject.id,
        },
        search: {
          operation: 'and',
          children: [
            {
              operation: 'field',
              field: 'type(raw)',
              type: 'Exact',
              values: ['Species' as DeliverableTypeType],
            },
            {
              operation: 'field',
              field: 'moduleId',
              type: 'Exact',
              values: [_modules.map((module) => module.id)],
            },
          ],
        },
      })
    );
    setRecentDeliverableSearchRequestId(deliverableRequest.requestId);
  }, [currentAcceleratorProject, isParticipantDataLoading, modules, activeLocale, dispatch]);

  // Initialize the hook
  useEffect(() => {
    reload();
  }, [reload]);

  return useMemo<DeliverableSearch>(
    () => ({
      deliverableSearchResults: recentDeliverablesSearchRequest?.data,
      hasActiveDeliverable: activeDeliverables.length > 0,
      hasRecentDeliverable: speciesDeliverables.length > 0,
      isLoading: recentDeliverablesSearchRequest?.status === 'pending' || isParticipantDataLoading,
      reload,
    }),
    [recentDeliverablesSearchRequest, activeDeliverables, speciesDeliverables, reload, isParticipantDataLoading]
  );
};
