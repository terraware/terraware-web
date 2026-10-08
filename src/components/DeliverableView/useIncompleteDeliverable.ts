import { useCallback, useMemo } from 'react';

import useApplicationPortal from 'src/hooks/useApplicationPortal';
import { useApplicationData } from 'src/providers/Application/Context';
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

  const { isApplicationConsole, isApplicationPortal } = useApplicationPortal();
  const { reload } = useApplicationData();

  const incomplete = useCallback(
    (deliverable: DeliverableWithOverdue) => {
      void incompleteSubmission({ deliverableId: deliverable.id, projectId: deliverable.projectId })
        .unwrap()
        .then(() => {
          if (isApplicationConsole || isApplicationPortal) {
            reload();
          }
        })
        .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
    },
    [incompleteSubmission, isApplicationConsole, isApplicationPortal, reload, snackbar]
  );

  const status = mutationStatus(result);

  return useMemo<Response>(() => ({ status, incomplete }), [status, incomplete]);
}
