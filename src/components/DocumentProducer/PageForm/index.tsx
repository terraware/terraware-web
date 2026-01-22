import React, { type JSX } from 'react';

import Form, { PageFormProps as FormProps } from '@terraware/web-components/components/PageForm';

import PageWorkflow from 'src/components/DocumentProducer/PageWorkflow';
import { WorkflowSuccessProps } from 'src/redux/hooks/useWorkflowSuccess';

export type PageFormProps = FormProps & WorkflowSuccessProps;

const PageForm = (props: PageFormProps): JSX.Element => {
  const { ...formProps }: FormProps = props;
  const { ...workflowProps }: WorkflowSuccessProps = props;

  return (
    <PageWorkflow {...workflowProps}>
      <Form {...formProps} />
    </PageWorkflow>
  );
};

export default PageForm;
