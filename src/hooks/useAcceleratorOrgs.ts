import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';
import { requestAcceleratorOrgs } from 'src/redux/features/accelerator/acceleratorAsyncThunks';
import { selectAcceleratorOrgsRequest } from 'src/redux/features/accelerator/acceleratorSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { AcceleratorOrg } from 'src/types/Accelerator';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  acceleratorOrgs?: AcceleratorOrg[];
  isBusy: boolean;
};

export const useAcceleratorOrgs = (includeParticipants?: boolean): Response => {
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectAcceleratorOrgsRequest(requestId));

  useEffect(() => {
    const request = dispatch(requestAcceleratorOrgs({ locale: activeLocale, includeParticipants }));
    setRequestId(request.requestId);
  }, [activeLocale, dispatch, includeParticipants]);

  useEffect(() => {
    if (result?.status === 'error') {
      // TODO this need to come back when we are only making this request in the accelerator side of things. Currently
      // this call happens in the participant deliverables table, showing a random error since they don't have
      // accelerator admin permissions.
      // snackbar.toastError();
    }
  }, [result?.status, snackbar]);

  return useMemo<Response>(
    () => ({
      acceleratorOrgs: result?.status === 'success' ? result?.data : [],
      isBusy: result?.status === 'pending',
    }),
    [result]
  );
};
