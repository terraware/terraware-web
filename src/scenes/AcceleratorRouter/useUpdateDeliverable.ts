import { useCallback, useEffect, useMemo, useState } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import {
  requestGetDeliverable,
  requestUpdateDeliverable,
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesEditRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Deliverable } from 'src/types/Deliverables';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  internalComment?: string;
  status?: Statuses;
  update: (deliverable: Deliverable) => void;
};

/**
 * Hook to update a deliverable, which updates the underlying deliverable submission (used for internalComments and status currently).
 * Returns status on request and function to update status.
 */
export default function useUpdateDeliverable(): Response {
  const [lastRequest, setLastRequest] = useState<Deliverable>();
  const [requestId, setRequestId] = useState<string>('');
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectDeliverablesEditRequest(requestId));

  const update = useCallback(
    (deliverable: Deliverable) => {
      setLastRequest(undefined);
      const dispatched = dispatch(requestUpdateDeliverable({ deliverable }));
      setRequestId(dispatched.requestId);
      setLastRequest(deliverable);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!lastRequest) {
      return;
    }

    if (result?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (result?.status === 'success') {
      // refresh deliverable data in store
      dispatch(requestGetDeliverable(result?.data!));
      if (lastRequest.status === 'Approved') {
        snackbar.toastSuccess(strings.DELIVERABLE_APPROVED);
      } else if (lastRequest.status === 'Rejected') {
        snackbar.toastWarning(strings.DELIVERABLE_REJECTED);
      } else {
        snackbar.toastInfo(strings.DELIVERABLE_STATUS_UPDATED);
      }
    }
  }, [dispatch, lastRequest, result, snackbar]);

  return useMemo<Response>(
    () => ({
      status: result?.status,
      update,
    }),
    [result?.status, update]
  );
}
