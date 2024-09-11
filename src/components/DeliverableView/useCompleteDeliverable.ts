import { useCallback, useEffect, useMemo, useState } from 'react';

import useApplicationPortal from 'src/hooks/useApplicationPortal';
import { useApplicationData } from 'src/providers/Application/Context';
import { Statuses } from 'src/redux/features/asyncUtils';
import {
  requestCompleteDeliverable,
  requestGetDeliverable,
  requestIncompleteDeliverable,
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesEditRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DeliverableWithOverdue } from 'src/types/Deliverables';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  status?: Statuses;
  complete: (deliverable: DeliverableWithOverdue) => void;
  incomplete: (deliverable: DeliverableWithOverdue) => void;
};

/**
 * Hook to submit a deliverable
 */
export default function useCompleteDeliverable(): Response {
  const [lastRequest, setLastRequest] = useState<DeliverableWithOverdue>();
  const [requestId, setRequestId] = useState<string>('');
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectDeliverablesEditRequest(requestId));

  const { isApplicationConsole, isApplicationPortal } = useApplicationPortal();
  const { reload } = useApplicationData();

  const complete = useCallback(
    (deliverable: DeliverableWithOverdue) => {
      setLastRequest(undefined);
      const dispatched = dispatch(
        requestCompleteDeliverable({ deliverableId: deliverable.id, projectId: deliverable.projectId })
      );
      setRequestId(dispatched.requestId);
      setLastRequest(deliverable);
    },
    [dispatch]
  );

  const incomplete = useCallback(
    (deliverable: DeliverableWithOverdue) => {
      setLastRequest(undefined);
      const dispatched = dispatch(
        requestIncompleteDeliverable({ deliverableId: deliverable.id, projectId: deliverable.projectId })
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
      // refresh deliverable data in store
      if (isApplicationConsole || isApplicationPortal) {
        reload();
      } else {
        dispatch(requestGetDeliverable({ deliverableId: lastRequest.id, projectId: lastRequest.projectId }));
      }
    }
  }, [dispatch, isApplicationConsole, isApplicationPortal, lastRequest, reload, result, snackbar]);

  return useMemo<Response>(
    () => ({
      status: result?.status,
      complete,
      incomplete,
    }),
    [result?.status, complete, incomplete]
  );
}
