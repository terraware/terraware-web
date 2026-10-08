import { useCallback, useMemo } from 'react';

import { useSubmitSubmissionMutation } from 'src/queries/generated/deliverables';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import { DeliverableWithOverdue } from 'src/types/Deliverables';
import { mutationStatus } from 'src/utils/mutationStatus';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  status?: Statuses;
  submit: (deliverable: DeliverableWithOverdue) => void;
};

/**
 * Hook to submit a deliverable
 */
export default function useSubmitDeliverable(): Response {
  const snackbar = useSnackbar();
  const [submitSubmission, submitResult] = useSubmitSubmissionMutation();

  const submit = useCallback(
    (deliverable: DeliverableWithOverdue) => {
      void submitSubmission({ deliverableId: deliverable.id, projectId: deliverable.projectId })
        .unwrap()
        .then(() => snackbar.toastSuccess(strings.DELIVERABLE_SUBMITTED))
        .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
    },
    [snackbar, submitSubmission]
  );

  return useMemo<Response>(() => ({ status: mutationStatus(submitResult), submit }), [submitResult, submit]);
}
