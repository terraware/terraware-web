import { useCallback, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { Deliverable } from 'src/types/Deliverables';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Statuses } from 'src/redux/features/asyncUtils';
import { selectDeliverableFetchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { requestDeliverableFetch } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import useSnackbar from 'src/utils/useSnackbar';

export type Props = {
  deliverableId: number;
  isAcceleratorConsole?: boolean;
};

export type Response = {
  status: Statuses;
  deliverable?: Deliverable;
};

/**
 * Hook to fetch a deliverable.
 * Returns status on request and the fetched deliverable.
 */
export default function useFetchDeliverable({ deliverableId, isAcceleratorConsole }: Props): Response {
  const snackbar = useSnackbar();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const deliverableResult = useAppSelector(selectDeliverableFetchRequest(deliverableId));

  const goToDeliverables = useCallback(() => {
    history.push(isAcceleratorConsole ? APP_PATHS.ACCELERATOR_DELIVERABLES : APP_PATHS.DELIVERABLES);
  }, [history, isAcceleratorConsole]);

  useEffect(() => {
    if (!isNaN(deliverableId)) {
      dispatch(requestDeliverableFetch(deliverableId));
    } else {
      goToDeliverables();
    }
  }, [dispatch, deliverableId, goToDeliverables]);

  useEffect(() => {
    if (deliverableResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
      goToDeliverables();
    }
  }, [deliverableResult?.status, goToDeliverables, snackbar]);

  return useMemo<Response>(
    () => ({
      status: deliverableResult?.status ?? 'pending',
      deliverable: deliverableResult?.data,
    }),
    [deliverableResult]
  );
}
