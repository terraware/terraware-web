import React, { type JSX } from 'react';

import DialogBox, { Props as DialogBoxProps } from '@terraware/web-components/components/DialogBox/DialogBox';

import PageWorkflow from 'src/components/DocumentProducer/PageWorkflow';
import { WorkflowSuccessProps } from 'src/redux/hooks/useWorkflowSuccess';

export type PageDialogProps = DialogBoxProps & WorkflowSuccessProps;

const PageDialog = (props: PageDialogProps): JSX.Element => {
  const { ...dialogProps }: DialogBoxProps = props;
  const { ...workflowProps }: WorkflowSuccessProps = props;

  return (
    <PageWorkflow {...workflowProps}>
      <DialogBox {...dialogProps} />
    </PageWorkflow>
  );
};

export default PageDialog;
