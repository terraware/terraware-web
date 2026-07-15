import { useCallback, useEffect, useMemo } from 'react';

import { useInviteGlobalRolesUserMutation, useUpdateGlobalRolesMutation } from 'src/queries/generated/globalRoles';
import { useUpdateUserInternalInterestsMutation } from 'src/queries/generated/userInternalInterests';
import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  busy?: boolean;
  succeeded?: boolean;
  invite: (user: UserWithInternalnterests) => Promise<void>;
  update: (user: UserWithInternalnterests) => void;
};

export default function useUpdatePerson(): Response {
  const snackbar = useSnackbar();

  const [updateInternalInterests, updateInternalInterestsResponse] = useUpdateUserInternalInterestsMutation();
  const [updateGlobalRoles, updateGlobalRolesResponse] = useUpdateGlobalRolesMutation();
  const [inviteGlobalRolesUser, inviteGlobalRolesResponse] = useInviteGlobalRolesUserMutation();

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

  const invite = useCallback(
    async (user: UserWithInternalnterests) => {
      try {
        const response = await inviteGlobalRolesUser({
          email: user.email,
          globalRoles: user.globalRoles,
        }).unwrap();

        if (response.status !== 'ok') {
          snackbar.toastError(strings.GENERIC_ERROR);
          return;
        }

        if (user.internalInterests?.length > 0) {
          void updateInternalInterests({
            userId: response.user.id,
            updateUserInternalInterestsRequestPayload: { internalInterests: user.internalInterests },
          });
        }
      } catch (e) {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    },
    [inviteGlobalRolesUser, updateInternalInterests, snackbar]
  );

  useEffect(() => {
    if (updateInternalInterestsResponse.isError || updateGlobalRolesResponse.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [updateInternalInterestsResponse.isError, updateGlobalRolesResponse.isError, snackbar]);

  return useMemo<Response>(
    () => ({
      busy:
        updateInternalInterestsResponse.isLoading ||
        updateGlobalRolesResponse.isLoading ||
        inviteGlobalRolesResponse.isLoading,
      succeeded:
        (updateGlobalRolesResponse.isSuccess || inviteGlobalRolesResponse.isSuccess) &&
        (updateInternalInterestsResponse.isSuccess || updateInternalInterestsResponse.isUninitialized),
      update,
      invite,
    }),
    [update, invite, updateInternalInterestsResponse, updateGlobalRolesResponse, inviteGlobalRolesResponse]
  );
}
