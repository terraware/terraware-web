import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useQuery from 'src/utils/useQuery';
import { APP_PATHS } from 'src/constants';
import BatchWithdrawFlow from './BatchWithdrawFlow';

type BatchBulkWithdrawWrapperComponentProps = {
  withdrawalCreatedCallback?: () => void;
};
export default function BatchBulkWithdrawWrapperComponent(
  props: BatchBulkWithdrawWrapperComponentProps
): JSX.Element | null {
  const { withdrawalCreatedCallback } = props;
  const [batchIds, setBatchIds] = useState<string[]>();
  const [source, setSource] = useState<string | null>();
  const query = useQuery();
  const navigate = useNavigate();

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
