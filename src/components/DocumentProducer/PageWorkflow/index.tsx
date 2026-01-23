import React, { type JSX, useCallback, useState } from 'react';

import { BusySpinner } from '@terraware/web-components';

import useWorkflowSuccess, { WorkflowSuccessProps } from 'src/redux/hooks/useWorkflowSuccess';
import strings from 'src/strings';

import PartialErrorsDialog from './PartialErrorsDialog';

export type PageWorkflowProps = WorkflowSuccessProps & {
  children: React.ReactNode;
};

const PageWorkflow = (props: PageWorkflowProps): JSX.Element => {
  const { workflowState, successMessage, onSuccess, children } = props;
  const [partialError, setPartialError] = useState<string>('');
  const [successData, setSuccessData] = useState<any>();

  const onFinishPartialSuccess = useCallback(() => {
    setPartialError('');
    if (onSuccess) {
      onSuccess(successData);
    }
  }, [onSuccess, successData]);

  const onPartialSuccess = useCallback((data?: any, error?: string) => {
    setSuccessData(data);
    setPartialError(error || strings.GENERIC_ERROR);
  }, []);

  useWorkflowSuccess({
    workflowState,
    successMessage,
    onSuccess,
    onPartialSuccess,
  });

  return (
    <>
      {partialError && <PartialErrorsDialog onClose={onFinishPartialSuccess} partialError={partialError} />}
      {workflowState?.status === 'pending' && <BusySpinner withSkrim={true} />}
      {children}
    </>
  );
};

export default PageWorkflow;
