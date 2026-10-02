import { useCallback, useMemo } from 'react';

import useApplicationPortal from 'src/hooks/useApplicationPortal';
import { useApplicationData } from 'src/providers/Application/Context';
import { useCompleteSubmissionMutation, useIncompleteSubmissionMutation } from 'src/queries/generated/deliverables';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import { DeliverableWithOverdue } from 'src/types/Deliverables';
import { mutationStatus } from 'src/utils/mutationStatus';
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
  const snackbar = useSnackbar();
  const [completeSubmission, completeResult] = useCompleteSubmissionMutation();
  const [incompleteSubmission, incompleteResult] = useIncompleteSubmissionMutation();

  const { isApplicationConsole, isApplicationPortal } = useApplicationPortal();
  const { reload } = useApplicationData();

  const run = useCallback(
    (request: Promise<unknown>) => {
      void request
        .then(() => {
          if (isApplicationConsole || isApplicationPortal) {
            reload();
          }
        })
        .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
    },
    [isApplicationConsole, isApplicationPortal, reload, snackbar]
  );

  const complete = useCallback(
    (deliverable: DeliverableWithOverdue) =>
      run(completeSubmission({ deliverableId: deliverable.id, projectId: deliverable.projectId }).unwrap()),
    [completeSubmission, run]
  );

  const incomplete = useCallback(
    (deliverable: DeliverableWithOverdue) =>
      run(incompleteSubmission({ deliverableId: deliverable.id, projectId: deliverable.projectId }).unwrap()),
    [incompleteSubmission, run]
  );

  const status = mutationStatus(completeResult.isUninitialized ? incompleteResult : completeResult);

  return useMemo<Response>(() => ({ status, complete, incomplete }), [status, complete, incomplete]);
}
