import { useEffect, useMemo } from 'react';

import { useGetUserInternalInterestsQuery } from 'src/queries/generated/userInternalInterests';
import { useGetUserQuery } from 'src/queries/generated/users';
import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

const usePerson = (userId: number): UserWithInternalnterests | undefined => {
  const snackbar = useSnackbar();

  const {
    currentData: userData,
    isSuccess: userSuccess,
    isError: userError,
  } = useGetUserQuery(userId, { skip: userId === -1 });
  const {
    data: internalInterestsData,
    isSuccess: isInternalInterestsSuccess,
    isError: isInternalInterestsError,
  } = useGetUserInternalInterestsQuery(userId, { skip: userId === -1 });

  useEffect(() => {
    if (userError || isInternalInterestsError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [isInternalInterestsError, userError, snackbar]);

  return useMemo<UserWithInternalnterests | undefined>(() => {
    if (userSuccess && isInternalInterestsSuccess && userData?.user) {
      const internalInterests = internalInterestsData?.internalInterests || [];
      return { ...userData.user, internalInterests };
    }
    return undefined;
  }, [internalInterestsData, isInternalInterestsSuccess, userData, userSuccess]);
};

export default usePerson;
