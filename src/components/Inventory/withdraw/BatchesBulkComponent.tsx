import React from 'react';
import { ServerOrganization } from 'src/types/Organization';
import BatchWithdrawFlow from './BatchWithdrawFlow';

type BatchesBulkComponentProps = {
  organization: ServerOrganization;
  batchesIds: string[];
};
export default function BatchesBulkComponent(props: BatchesBulkComponentProps): JSX.Element {
  const { organization, batchesIds } = props;

  return <BatchWithdrawFlow batchesIds={batchesIds} organization={organization} />;
}
