import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestUpdateGlobalRolesUser } from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import { selectGlobalRolesUserUpdateRequest } from 'src/redux/features/globalRoles/globalRolesSelectors';
import { requestUpdateUserInternalInterests } from 'src/redux/features/userInternalInterests/userInternalInterestsAsyncThunks';
import { selectUserInternalInterestsUpdateRequest } from 'src/redux/features/userInternalInterests/userInternalInterestsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  busy?: boolean;
  succeeded?: boolean;
  update: (user: UserWithInternalnterests) => void;
};

export default function useUpdatePerson(): Response {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [internalInterestsRequestId, setInternalInterestsRequest] = useState('');
  const internalInterestsRequest = useAppSelector(selectUserInternalInterestsUpdateRequest(internalInterestsRequestId));
  const [globalRolesRequestId, setGlobalRolesRequestId] = useState('');
  const globalRolesRequest = useAppSelector(selectGlobalRolesUserUpdateRequest(globalRolesRequestId));

  const update = useCallback(
    (user: UserWithInternalnterests) => {
      const categoriesRequest = dispatch(
        requestUpdateUserInternalInterests({
          user: user,
          internalInterests: user.internalInterests,
        })
      );

      setInternalInterestsRequest(categoriesRequest.requestId);

      const globalRolesRequest = dispatch(
        requestUpdateGlobalRolesUser({
          user: user,
          globalRoles: user.globalRoles,
        })
      );

      setGlobalRolesRequestId(globalRolesRequest.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (internalInterestsRequest?.status === 'error' || globalRolesRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [internalInterestsRequest, globalRolesRequest, snackbar]);

  return useMemo<Response>(
    () => ({
      busy: internalInterestsRequest?.status === 'pending' || globalRolesRequest?.status === 'pending',
      succeeded: internalInterestsRequest?.status === 'success' && globalRolesRequest?.status === 'success',
      update,
    }),
    [update, internalInterestsRequest, globalRolesRequest]
  );
}
