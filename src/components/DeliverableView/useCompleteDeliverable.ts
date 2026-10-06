import { useCallback, useMemo } from 'react';

import { useCompleteSubmissionMutation } from 'src/queries/generated/deliverables';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import { DeliverableWithOverdue } from 'src/types/Deliverables';
import { mutationStatus } from 'src/utils/mutationStatus';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  status?: Statuses;
  complete: (deliverable: DeliverableWithOverdue) => void;
};

/**
 * Hook to mark a deliverable as complete
 */
export default function useCompleteDeliverable(): Response {
  const snackbar = useSnackbar();
  const [completeSubmission, result] = useCompleteSubmissionMutation();

  const complete = useCallback(
    (deliverable: DeliverableWithOverdue) => {
      void completeSubmission({ deliverableId: deliverable.id, projectId: deliverable.projectId })
        .unwrap()
        .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
    },
    [completeSubmission, snackbar]
  );

  const status = mutationStatus(result);

  return useMemo<Response>(() => ({ status, complete }), [status, complete]);
}
