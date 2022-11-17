import React, { useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import useQuery from 'src/utils/useQuery';
import BatchWithdrawFlow from './BatchWithdrawFlow';

type BatchBulkWithdrawWrapperComponentProps = {
  organization: ServerOrganization;
};
export default function BatchBulkWithdrawWrapperComponent(
  props: BatchBulkWithdrawWrapperComponentProps
): JSX.Element | null {
  const { organization } = props;
  const [batchIds, setBatchIds] = useState<string[]>();
  const query = useQuery();

  useEffect(() => {
    if (query.getAll('batchId').length > 0) {
      setBatchIds(query.getAll('batchId'));
    }
  }, [query]);

  return batchIds ? <BatchWithdrawFlow batchIds={batchIds} organization={organization} /> : null;
}
