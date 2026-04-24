import React, { type JSX, useEffect, useMemo } from 'react';

import BatchWithdrawFlow from 'src/components/BatchWithdrawFlow';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useQuery from 'src/utils/useQuery';

export default function BatchBulkWithdrawView(): JSX.Element | null {
  const query = useQuery();
  const navigate = useSyncNavigate();

  const batchIds = useMemo(() => (query.getAll('batchId').length > 0 ? query.getAll('batchId') : undefined), [query]);

  const source = useMemo(() => (batchIds ? query.get('source') : undefined), [batchIds, query]);

  useEffect(() => {
    if (!batchIds) {
      // invalid url params
      navigate({ pathname: APP_PATHS.INVENTORY });
    }
  }, [batchIds, navigate]);

  return batchIds ? <BatchWithdrawFlow batchIds={batchIds} sourcePage={source || undefined} /> : null;
}
