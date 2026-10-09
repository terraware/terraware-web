import { useCallback, useMemo } from 'react';

import { useUpdateVariableWorkflowDetailsMutation } from 'src/queries/generated/documentProducerVariables';
import strings from 'src/strings';
import { VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';
import useSnackbar from 'src/utils/useSnackbar';

type ProjectVariableWorkflow = {
  initialStatus: VariableStatusType;
  initialFeedback?: string;
  initialInternalCommnet?: string;
  update: (status: VariableStatusType, feedback?: string, internalComment?: string, onSuccess?: () => void) => void;
};

export const useProjectVariableWorklow = (
  projectId: number,
  variableWithValues: VariableWithValues
): ProjectVariableWorkflow => {
  const [updateVariableWorkflowDetails] = useUpdateVariableWorkflowDetailsMutation();
  const snackbar = useSnackbar();
  const firstVariableValue: VariableValue | undefined = (variableWithValues.variableValues || [])[0];

  const initialStatus: VariableStatusType = firstVariableValue?.status ?? 'Not Submitted';
  const initialFeedback: string | undefined = firstVariableValue?.feedback;
  const initialInternalCommnet: string | undefined = firstVariableValue?.internalComment;

  const update = useCallback(
    (status: VariableStatusType, feedback?: string, internalComment?: string, onSuccess?: () => void) => {
      if (initialStatus === status && initialFeedback === feedback && initialInternalCommnet === internalComment) {
        onSuccess?.();
        return;
      }
      if (status !== undefined) {
        void updateVariableWorkflowDetails({
          projectId,
          variableId: variableWithValues.id,
          updateVariableWorkflowDetailsRequestPayload: { status, feedback, internalComment },
        })
          .unwrap()
          .then(() => onSuccess?.())
          .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
      }
    },
    [
      initialFeedback,
      initialInternalCommnet,
      initialStatus,
      projectId,
      snackbar,
      updateVariableWorkflowDetails,
      variableWithValues.id,
    ]
  );

  return useMemo<ProjectVariableWorkflow>(
    () => ({
      initialStatus,
      initialFeedback,
      initialInternalCommnet,
      update,
    }),
    [initialStatus, initialFeedback, initialInternalCommnet, update]
  );
};
