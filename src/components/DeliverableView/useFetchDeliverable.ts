import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { Statuses } from 'src/redux/features/asyncUtils';
import { requestGetDeliverable } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverableFetchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Deliverable } from 'src/types/Deliverables';
import useSnackbar from 'src/utils/useSnackbar';

export type Props = {
  deliverableId: number;
  projectId: number;
};

export type Response = {
  status: Statuses;
  deliverable?: Deliverable;
};

/**
 * Hook to fetch a deliverable.
 * Returns status on request and the fetched deliverable.
 */
export default function useFetchDeliverable({ deliverableId, projectId }: Props): Response {
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const snackbar = useSnackbar();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState('');
  const [deliverable, setDeliverable] = useState<Deliverable>();

  const deliverableResult = useAppSelector(selectDeliverableFetchRequest(requestId));

  const goToDeliverables = useCallback(() => {
    history.push(isAcceleratorRoute ? APP_PATHS.ACCELERATOR_DELIVERABLES : APP_PATHS.DELIVERABLES);
  }, [history, isAcceleratorRoute]);

  useEffect(() => {
    if (!isNaN(deliverableId)) {
      const request = dispatch(requestGetDeliverable({ deliverableId, projectId }));
      setRequestId(request.requestId);
    } else {
      goToDeliverables();
    }
  }, [dispatch, deliverableId, goToDeliverables, projectId]);

  useEffect(() => {
    if (deliverableResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
      goToDeliverables();
    } else if (deliverableResult?.status === 'success' && deliverableResult?.data) {
      setDeliverable(deliverableResult.data);
    }
  }, [deliverableResult?.status, deliverableResult?.data, goToDeliverables, snackbar]);

  return useMemo<Response>(
    () => ({
      status: deliverableResult?.status ?? 'pending',
      deliverable,
    }),
    [deliverableResult, deliverable]
  );
}
