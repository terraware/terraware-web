import { useCallback, useEffect, useMemo, useState } from 'react';
import strings from 'src/strings';
import { UpdateStatusRequest } from 'src/types/Deliverables';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Statuses } from 'src/redux/features/asyncUtils';
import { selectDeliverablesEditRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import {
  requestDeliverableFetch,
  requestUpdateDeliverableStatus,
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  status?: Statuses;
  update: (request: UpdateStatusRequest) => void;
};

/**
 * Hook to update a deliverable status.
 * Returns status on request and function to update status.
 */
export default function useEditStatusDeliverable(): Response {
  const [requestId, setRequestId] = useState<string>('');
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectDeliverablesEditRequest(requestId));

  const update = useCallback(
    (request: UpdateStatusRequest) => {
      const dispatched = dispatch(requestUpdateDeliverableStatus(request));
      setRequestId(dispatched.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (result?.status === 'success') {
      // refresh deliverable data in store
      dispatch(requestDeliverableFetch(result?.data!));
    }
  }, [dispatch, result, snackbar]);

  return useMemo<Response>(
    () => ({
      status: result?.status,
      update,
    }),
    [result?.status, update]
  );
}
