import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestUpdateFundingEntity } from 'src/redux/features/funder/fundingEntitiesAsyncThunks';
import { selectFundingEntityUpdateRequest } from 'src/redux/features/funder/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  busy?: boolean;
  succeeded?: boolean;
  update: (fundingEntity: FundingEntity) => void;
};

export default function useUpdateFundingEntity(): Response {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const [requestId, setRequestId] = useState('');
  const updateRequest = useAppSelector(selectFundingEntityUpdateRequest(requestId));

  const update = useCallback(
    (fundingEntity: FundingEntity) => {
      const request = dispatch(
        requestUpdateFundingEntity({
          fundingEntity: fundingEntity,
        })
      );

      setRequestId(request.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (updateRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [updateRequest, snackbar]);

  return useMemo<Response>(
    () => ({
      busy: updateRequest?.status === 'pending',
      succeeded: updateRequest?.status === 'success',
      update,
    }),
    [update, updateRequest]
  );
}
