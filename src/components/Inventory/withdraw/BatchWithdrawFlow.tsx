import React, { useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import SelectPurposeForm from './flow/SelectPurposeForm';

type FlowStates = ['purpose' | 'select batches' | 'photos'];

type BatchWithdrawFlowProps = {
  organization: ServerOrganization;
  batchIds: string[];
};

export default function BatchWithdrawFlow(props: BatchWithdrawFlowProps): JSX.Element {
  const { organization, batchIds } = props;
  const [, setFlowState] = useState<FlowStates>('purpose' as unknown as FlowStates);

  const onPurposeSelected = () => {
    if (batchIds.length === 1) {
      setFlowState('photos' as unknown as FlowStates);
    } else {
      setFlowState('select batches' as unknown as FlowStates);
    }
  };

  return <SelectPurposeForm onNext={onPurposeSelected} organization={organization} batchIds={batchIds} />;
}
