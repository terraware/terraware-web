import { useCallback, useEffect, useMemo, useState } from 'react';

import { selectUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

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
  const dispatch = useAppDispatch();
  const firstVariableValue: VariableValue | undefined = (variableWithValues.variableValues || [])[0];

  const initialStatus: VariableStatusType = firstVariableValue?.status ?? 'Not Submitted';
  const initialFeedback: string | undefined = firstVariableValue?.feedback;
  const initialInternalCommnet: string | undefined = firstVariableValue?.internalComment;

  const [callback, setCallback] = useState<() => void>();
  const [requestId, setRequestId] = useState('');
  const updateResult = useAppSelector(selectUpdateVariableWorkflowDetails(requestId));

  const update = useCallback(
    (status: VariableStatusType, feedback?: string, internalComment?: string, onSuccess?: () => void) => {
      if (initialStatus === status && initialFeedback === feedback && initialInternalCommnet === internalComment) {
        onSuccess?.();
        return;
      }
      if (status !== undefined) {
        const request = dispatch(
          requestUpdateVariableWorkflowDetails({
            status,
            feedback,
            internalComment,
            projectId,
            variableId: variableWithValues.id,
          })
        );
        setRequestId(request.requestId);
        setCallback(onSuccess);
      }
    },
    [dispatch, initialFeedback, initialInternalCommnet, initialStatus]
  );

  useEffect(() => {
    if (updateResult && updateResult.status === 'success') {
      callback?.();
    }
  }, [callback, updateResult]);

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
