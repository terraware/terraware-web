import { useCallback, useEffect, useMemo } from 'react';

import { useUpdateGlobalRolesMutation } from 'src/queries/generated/globalRoles';
import { useUpdateUserInternalInterestsMutation } from 'src/queries/generated/userInternalInterests';
import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  busy?: boolean;
  succeeded?: boolean;
  update: (user: UserWithInternalnterests) => void;
};

export default function useUpdatePerson(): Response {
  const snackbar = useSnackbar();

  const [updateInternalInterests, updateInternalInterestsResponse] = useUpdateUserInternalInterestsMutation();
  const [updateGlobalRoles, updateGlobalRolesResponse] = useUpdateGlobalRolesMutation();

  const update = useCallback(
    (user: UserWithInternalnterests) => {
      void updateInternalInterests({
        userId: user.id,
        updateUserInternalInterestsRequestPayload: { internalInterests: user.internalInterests },
      });

      void updateGlobalRoles({
        userId: user.id,
        updateGlobalRolesRequestPayload: { globalRoles: user.globalRoles },
      });
    },
    [updateInternalInterests, updateGlobalRoles]
  );

  useEffect(() => {
    if (updateInternalInterestsResponse.isError || updateGlobalRolesResponse.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [updateInternalInterestsResponse.isError, updateGlobalRolesResponse.isError, snackbar]);

  return useMemo<Response>(
    () => ({
      busy: updateInternalInterestsResponse.isLoading || updateGlobalRolesResponse.isLoading,
      succeeded: updateInternalInterestsResponse.isSuccess && updateGlobalRolesResponse.isSuccess,
      update,
    }),
    [update, updateInternalInterestsResponse, updateGlobalRolesResponse]
  );
}
