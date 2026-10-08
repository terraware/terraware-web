import { useCallback, useEffect, useMemo } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';

import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useGetDeliverableQuery } from 'src/queries/generated/deliverables';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import { DeliverableWithOverdue, withOverdueStatus } from 'src/types/Deliverables';
import useSnackbar from 'src/utils/useSnackbar';

export type Props = {
  deliverableId: number;
  projectId: number;
};

export type Response = {
  status: Statuses;
  deliverable?: DeliverableWithOverdue;
};

/**
 * Hook to fetch a deliverable.
 * Returns status on request and the fetched deliverable.
 */
export default function useFetchDeliverable({ deliverableId, projectId }: Props): Response {
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();

  const { currentData, isError } = useGetDeliverableQuery(
    isNaN(deliverableId) ? skipToken : { deliverableId, projectId }
  );

  const goToDeliverables = useCallback(() => {
    navigate(isAcceleratorRoute ? APP_PATHS.ACCELERATOR_DELIVERABLES : APP_PATHS.DELIVERABLES);
  }, [navigate, isAcceleratorRoute]);

  useEffect(() => {
    if (isNaN(deliverableId)) {
      goToDeliverables();
    }
  }, [deliverableId, goToDeliverables]);

  useEffect(() => {
    if (isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
      goToDeliverables();
    }
  }, [isError, goToDeliverables, snackbar]);

  return useMemo<Response>(
    () => ({
      status: isError ? 'error' : currentData ? 'success' : 'pending',
      deliverable: currentData?.deliverable ? withOverdueStatus(currentData.deliverable) : undefined,
    }),
    [currentData, isError]
  );
}
