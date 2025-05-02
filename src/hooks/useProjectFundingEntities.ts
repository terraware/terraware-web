import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestProjectFundingEntities } from 'src/redux/features/funder/fundingEntitiesAsyncThunks';
import { selectProjectFundingEntities } from 'src/redux/features/funder/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { FundingEntity } from 'src/types/FundingEntity';

const useProjectFundingEntities = (projectId?: number | string) => {
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState('');
  const [fundingEntities, setFundingEntities] = useState<FundingEntity[]>([]);

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

  useEffect(() => {
    if (listFundingEntitiesRequest?.status === 'success') {
      setFundingEntities(listFundingEntitiesRequest?.data || []);
    }
  }, [listFundingEntitiesRequest]);

  const busy = useMemo(() => listFundingEntitiesRequest?.status === 'pending', [listFundingEntitiesRequest]);

  return { busy, reload, fundingEntities };
};

export default useProjectFundingEntities;
