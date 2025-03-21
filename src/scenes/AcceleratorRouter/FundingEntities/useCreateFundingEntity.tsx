import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestCreateFundingEntity } from 'src/redux/features/funder/fundingEntitiesAsyncThunks';
import { selectFundingEntityCreateRequest } from 'src/redux/features/funder/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  busy?: boolean;
  succeeded?: boolean;
  data?: FundingEntity;
  create: (fundingEntity: FundingEntity) => void;
};

export default function useCreateFundingEntity(): Response {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const [requestId, setRequestId] = useState('');
  const createRequest = useAppSelector(selectFundingEntityCreateRequest(requestId));

  const create = useCallback(
    (fundingEntity: FundingEntity) => {
      const request = dispatch(
        requestCreateFundingEntity({
          fundingEntity: fundingEntity,
        })
      );

      setRequestId(request.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (createRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [createRequest, snackbar]);

  return useMemo<Response>(
    () => ({
      busy: createRequest?.status === 'pending',
      succeeded: createRequest?.status === 'success',
      data: createRequest?.data?.fundingEntity,
      create,
    }),
    [create, createRequest]
  );
}
