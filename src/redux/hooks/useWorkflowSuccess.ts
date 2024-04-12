import { useEffect } from 'react';

import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import { Statuses } from '../features/asyncUtils';

export type SelectedState = {
  status: Statuses;
  error?: string;
  updatedAt?: number;
};

export type WorkflowSuccessProps = {
  workflowState?: SelectedState & { data?: any };
  successMessage?: string;
  onSuccess?: (data?: any) => void;
  onPartialSuccess?: (data?: any, error?: string) => void;
};

const useWorkflowSuccess = (props: WorkflowSuccessProps) => {
  const { workflowState, successMessage, onSuccess, onPartialSuccess } = props;

  const snackbar = useSnackbar();

  useEffect(() => {
    if (workflowState?.status === 'error') {
      snackbar.toastError(workflowState?.error || strings.GENERIC_ERROR);
    }
  }, [workflowState?.error, workflowState?.status, snackbar]);

  useEffect(() => {
    if (workflowState?.status === 'partial-success') {
      if (onPartialSuccess) {
        onPartialSuccess(workflowState?.data, workflowState?.error);
      }
    } else if (workflowState?.status === 'success') {
      snackbar.toastSuccess(successMessage || strings.SUCCESS);
      if (onSuccess) {
        onSuccess(workflowState?.data);
      }
    }
  }, [
    workflowState?.status,
    workflowState?.data,
    workflowState?.error,
    onSuccess,
    onPartialSuccess,
    snackbar,
    successMessage,
  ]);
};

export default useWorkflowSuccess;
