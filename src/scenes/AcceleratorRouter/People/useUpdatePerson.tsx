import { useCallback, useEffect, useMemo, useState } from 'react';

import { useUpdateGlobalRolesMutation } from 'src/queries/generated/globalRoles';
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
  const [updateGlobalRoles, updateGlobalRolesResponse] = useUpdateGlobalRolesMutation();

  const update = useCallback(
    (user: UserWithInternalnterests) => {
      const categoriesRequest = dispatch(
        requestUpdateUserInternalInterests({
          user,
          internalInterests: user.internalInterests,
        })
      );

      setInternalInterestsRequest(categoriesRequest.requestId);

      void updateGlobalRoles({
        userId: user.id,
        updateGlobalRolesRequestPayload: { globalRoles: user.globalRoles },
      });
    },
    [dispatch, updateGlobalRoles]
  );

  useEffect(() => {
    if (internalInterestsRequest?.status === 'error' || updateGlobalRolesResponse.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [internalInterestsRequest, updateGlobalRolesResponse.isError, snackbar]);

  return useMemo<Response>(
    () => ({
      busy: internalInterestsRequest?.status === 'pending' || updateGlobalRolesResponse.isLoading,
      succeeded: internalInterestsRequest?.status === 'success' && updateGlobalRolesResponse.isSuccess,
      update,
    }),
    [update, internalInterestsRequest, updateGlobalRolesResponse]
  );
}
