import React, { useState } from 'react';
import { NurseryWithdrawal } from 'src/api/types/batch';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import AddPhotos from './flow/AddPhotos';
import SelectBatches from './flow/SelectBatches';
import SelectPurposeForm from './flow/SelectPurposeForm';

type FlowStates = 'purpose' | 'select batches' | 'photos';

type BatchWithdrawFlowProps = {
  organization: ServerOrganization;
  batchIds: string[];
};

export default function BatchWithdrawFlow(props: BatchWithdrawFlowProps): JSX.Element {
  const { organization, batchIds } = props;
  const [flowState, setFlowState] = useState<FlowStates>('purpose');
  const [record, setRecord] = useForm<NurseryWithdrawal[]>([]);

  const onPurposeSelected = () => {
    if (batchIds.length === 1) {
      setFlowState('photos');
    } else {
      setFlowState('select batches');
    }
  };

  const onBatchesSelected = () => {
    setFlowState('photos');
  };

  return (
    <>
      {flowState === 'purpose' && (
        <SelectPurposeForm
          onNext={onPurposeSelected}
          organization={organization}
          batchIds={batchIds}
          record={record}
          setRecord={setRecord}
        />
      )}
      {flowState === 'select batches' && <SelectBatches onNext={onBatchesSelected} organization={organization} />}
      {flowState === 'photos' && <AddPhotos onNext={onPurposeSelected} organization={organization} />}
    </>
  );
}
