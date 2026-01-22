import React, { type JSX, useEffect, useState } from 'react';

import BatchWithdrawFlow from 'src/components/BatchWithdrawFlow';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useQuery from 'src/utils/useQuery';

type BatchBulkWithdrawViewProps = {
  withdrawalCreatedCallback?: () => void;
};
export default function BatchBulkWithdrawView(props: BatchBulkWithdrawViewProps): JSX.Element | null {
  const { withdrawalCreatedCallback } = props;
  const [batchIds, setBatchIds] = useState<string[]>();
  const [source, setSource] = useState<string | null>();
  const query = useQuery();
  const navigate = useSyncNavigate();

  useEffect(() => {
    if (query.getAll('batchId').length > 0) {
      setBatchIds(query.getAll('batchId'));
      setSource(query.get('source'));
    } else {
      // invalid url params
      navigate({ pathname: APP_PATHS.INVENTORY });
    }
  }, [query, navigate]);

  return batchIds ? (
    <BatchWithdrawFlow
      batchIds={batchIds}
      sourcePage={source || undefined}
      withdrawalCreatedCallback={withdrawalCreatedCallback}
    />
  ) : null;
}
