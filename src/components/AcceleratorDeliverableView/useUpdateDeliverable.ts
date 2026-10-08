import { useCallback, useMemo } from 'react';

import { useUpdateSubmissionMutation } from 'src/queries/generated/deliverables';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import { Deliverable } from 'src/types/Deliverables';
import { mutationStatus } from 'src/utils/mutationStatus';
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
  const snackbar = useSnackbar();
  const [updateSubmission, updateResult] = useUpdateSubmissionMutation();

  const update = useCallback(
    (deliverable: Deliverable) => {
      void updateSubmission({
        deliverableId: deliverable.id,
        projectId: deliverable.projectId,
        updateSubmissionRequestPayload: {
          status: deliverable.status,
          ...(deliverable.internalComment ? { internalComment: deliverable.internalComment } : {}),
          ...(deliverable.feedback ? { feedback: deliverable.feedback } : {}),
        },
      })
        .unwrap()
        .then(() => {
          if (deliverable.status === 'Approved') {
            snackbar.toastSuccess(strings.DELIVERABLE_APPROVED);
          } else if (deliverable.status === 'Rejected') {
            snackbar.toastWarning(strings.DELIVERABLE_UPDATE_REQUESTED);
          } else if (deliverable.status === 'In Review') {
            snackbar.toastSuccess(strings.DELIVERABLE_SUBMITTED_FOR_APPROVAL);
          } else {
            snackbar.toastInfo(strings.DELIVERABLE_STATUS_UPDATED);
          }
        })
        .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
    },
    [snackbar, updateSubmission]
  );

  return useMemo<Response>(() => ({ status: mutationStatus(updateResult), update }), [updateResult, update]);
}
