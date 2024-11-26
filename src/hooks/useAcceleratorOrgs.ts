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

// The default behavior, if no options are passed in with the props,
//   is to get all organizations that have an "accelerator internal tag"
//
// The `includeParticipants` option will additionally contain organizations that have no internal tags,
//   but do have a project that is associated to a participant
//
// The `hasProjectApplication` option will only return organizations that have no internal tags,
//   but have a project that has an application submitted
export const useAcceleratorOrgs = (props?: {
  includeParticipants?: boolean;
  hasProjectApplication?: boolean;
}): Response => {
  const { includeParticipants, hasProjectApplication } = props || {};

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
    const request = dispatch(
      requestAcceleratorOrgs({ locale: activeLocale, hasProjectApplication, includeParticipants })
    );
    setRequestId(request.requestId);
  }, [activeLocale, dispatch, hasProjectApplication, includeParticipants]);

  useEffect(() => {
    reload();
  }, [reload]);

  return useMemo<Response>(
    () => ({
      acceleratorOrgs: result?.status === 'success' ? result?.data : [],
      isBusy: result?.status === 'pending',
      reload,
    }),
    [result]
  );
};
