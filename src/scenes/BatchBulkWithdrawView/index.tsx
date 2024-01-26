import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useQuery from 'src/utils/useQuery';
import { APP_PATHS } from 'src/constants';
import BatchWithdrawFlow from 'src/components/BatchWithdrawFlow';

type BatchBulkWithdrawViewProps = {
  withdrawalCreatedCallback?: () => void;
};
export default function BatchBulkWithdrawView(props: BatchBulkWithdrawViewProps): JSX.Element | null {
  const { withdrawalCreatedCallback } = props;
  const [batchIds, setBatchIds] = useState<string[]>();
  const [source, setSource] = useState<string | null>();
  const query = useQuery();
  const history = useHistory();

  useEffect(() => {
    if (query.getAll('batchId').length > 0) {
      setBatchIds(query.getAll('batchId'));
      setSource(query.get('source'));
    } else {
      // invalid url params
      history.push({ pathname: APP_PATHS.INVENTORY });
    }
  }, [query, history]);

  return batchIds ? (
    <BatchWithdrawFlow
      batchIds={batchIds}
      sourcePage={source || undefined}
      withdrawalCreatedCallback={withdrawalCreatedCallback}
    />
  ) : null;
}
