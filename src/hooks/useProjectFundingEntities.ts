import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestProjectFundingEntities } from 'src/redux/features/funder/entities/fundingEntitiesAsyncThunks';
import { selectProjectFundingEntities } from 'src/redux/features/funder/entities/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

const useProjectFundingEntities = (projectId?: number | string) => {
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState('');

  const listFundingEntitiesRequest = useAppSelector(selectProjectFundingEntities(requestId));

  const reload = useCallback(() => {
    if (projectId) {
      const request = dispatch(
        requestProjectFundingEntities({
          projectId: Number(projectId),
        })
      );
      setRequestId(request.requestId);
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const fundingEntities = useMemo(
    () => (listFundingEntitiesRequest?.status === 'success' ? listFundingEntitiesRequest?.data || [] : []),
    [listFundingEntitiesRequest]
  );

  const busy = useMemo(() => listFundingEntitiesRequest?.status === 'pending', [listFundingEntitiesRequest]);

  return { busy, reload, fundingEntities };
};

export default useProjectFundingEntities;
