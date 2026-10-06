import { useCallback, useMemo } from 'react';

import { useIncompleteSubmissionMutation } from 'src/queries/generated/deliverables';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import { DeliverableWithOverdue } from 'src/types/Deliverables';
import { mutationStatus } from 'src/utils/mutationStatus';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  status?: Statuses;
  incomplete: (deliverable: DeliverableWithOverdue) => void;
};

/**
 * Hook to mark a deliverable as incomplete
 */
export default function useIncompleteDeliverable(): Response {
  const snackbar = useSnackbar();
  const [incompleteSubmission, result] = useIncompleteSubmissionMutation();

  const incomplete = useCallback(
    (deliverable: DeliverableWithOverdue) => {
      void incompleteSubmission({ deliverableId: deliverable.id, projectId: deliverable.projectId })
        .unwrap()
        .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
    },
    [incompleteSubmission, snackbar]
  );

  const status = mutationStatus(result);

  return useMemo<Response>(() => ({ status, incomplete }), [status, incomplete]);
}
