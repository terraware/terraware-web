import { useCallback, useEffect, useMemo, useState } from 'react';

import { selectUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

type ProjectVariableWorkflow = {
  update: (onSuccess?: () => void) => void;
  status?: VariableStatusType;
  feedback?: string;
  internalComment?: string;
  setStatus: (status: VariableStatusType) => void;
  setFeedback: (feedback?: string) => void;
  setInternalComment: (internalComment?: string) => void;
};

export const useProjectVariableWorklow = (
  projectId: number,
  variableWithValues: VariableWithValues
): ProjectVariableWorkflow => {
  const dispatch = useAppDispatch();
  const firstVariableValue: VariableValue | undefined = (variableWithValues.variableValues || [])[0];

  const existingStatus: VariableStatusType | undefined = firstVariableValue?.status;
  const existingFeedback: string | undefined = firstVariableValue?.feedback;
  const existingInternalCommnet: string | undefined = firstVariableValue?.internalComment;

  const [status, setStatus] = useState(existingStatus);
  const [feedback, setFeedback] = useState(existingFeedback);
  const [internalComment, setInternalComment] = useState(existingInternalCommnet);

  const [callback, setCallback] = useState<() => void>();
  const [requestId, setRequestId] = useState('');
  const updateResult = useAppSelector(selectUpdateVariableWorkflowDetails(requestId));

  const update = useCallback(
    (onSuccess?: () => void) => {
      if (existingStatus === status && existingFeedback === feedback && existingInternalCommnet === internalComment) {
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
    [dispatch, feedback, internalComment, status]
  );

  useEffect(() => {
    if (updateResult && updateResult.status === 'success') {
      callback?.();
    }
  }, [callback, updateResult]);

  return useMemo<ProjectVariableWorkflow>(
    () => ({
      update,
      status,
      feedback,
      internalComment,
      setStatus,
      setFeedback,
      setInternalComment,
    }),
    [update, status, feedback, internalComment, setStatus, setFeedback, setInternalComment]
  );
};
