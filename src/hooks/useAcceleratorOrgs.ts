import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';
import { requestAcceleratorOrgs } from 'src/redux/features/accelerator/acceleratorAsyncThunks';
import { selectAcceleratorOrgsRequest } from 'src/redux/features/accelerator/acceleratorSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { AcceleratorOrg } from 'src/types/Accelerator';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  acceleratorOrgs?: AcceleratorOrg[];
  isBusy: boolean;
  reload: () => void;
};

// Get all organizations that have a project with a phase or an application
export const useAcceleratorOrgs = (): Response => {
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectAcceleratorOrgsRequest(requestId));

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    }
  }, [result?.status, snackbar]);

  const reload = useCallback(() => {
    const request = dispatch(requestAcceleratorOrgs({ locale: activeLocale }));
    setRequestId(request.requestId);
  }, [activeLocale, dispatch]);

  useEffect(() => {
    reload();
  }, [reload]);

  return useMemo<Response>(
    () => ({
      acceleratorOrgs: result?.status === 'success' ? result?.data : [],
      isBusy: result?.status === 'pending',
      reload,
    }),
    [result, reload]
  );
};
