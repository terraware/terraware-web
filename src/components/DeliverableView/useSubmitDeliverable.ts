import { useCallback, useEffect, useMemo, useState } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import {
  requestGetDeliverable,
  requestSubmitDeliverable,
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesEditRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DeliverableWithOverdue } from 'src/types/Deliverables';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  status?: Statuses;
  submit: (deliverable: DeliverableWithOverdue) => void;
};

/**
 * Hook to submit a deliverable
 */
export default function useSubmitDeliverable(): Response {
  const [lastRequest, setLastRequest] = useState<DeliverableWithOverdue>();
  const [requestId, setRequestId] = useState<string>('');
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectDeliverablesEditRequest(requestId));

  const submit = useCallback(
    (deliverable: DeliverableWithOverdue) => {
      setLastRequest(undefined);
      const dispatched = dispatch(
        requestSubmitDeliverable({ deliverableId: deliverable.id, projectId: deliverable.projectId })
      );
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
      snackbar.toastSuccess(strings.DELIVERABLE_SUBMITTED);
      // refresh deliverable data in store
      dispatch(requestGetDeliverable({ deliverableId: lastRequest.id, projectId: lastRequest.projectId }));
    }
  }, [dispatch, lastRequest, result, snackbar]);

  return useMemo<Response>(
    () => ({
      status: result?.status,
      submit,
    }),
    [result?.status, submit]
  );
}
