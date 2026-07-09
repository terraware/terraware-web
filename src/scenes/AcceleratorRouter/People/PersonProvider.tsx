import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { useGetUserInternalInterestsQuery } from 'src/queries/generated/userInternalInterests';
import { useGetUserQuery } from 'src/queries/generated/users';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import { PersonContext, PersonData } from './PersonContext';

export type Props = {
  children: React.ReactNode;
};

const PersonProvider = ({ children }: Props) => {
  const snackbar = useSnackbar();
  const pathParams = useParams<{ userId: string }>();
  const [userId, setUserId] = useState(Number(pathParams.userId || -1));

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

  const personData = useMemo<PersonData>(() => {
    if (userSuccess && isInternalInterestsSuccess && userData?.user) {
      const user = userData.user;
      const internalInterests = internalInterestsData?.internalInterests || [];
      return {
        setUserId,
        user: { ...user, internalInterests },
        userId,
      };
    }
    return { setUserId, userId };
  }, [internalInterestsData, isInternalInterestsSuccess, userData, userSuccess, userId, setUserId]);

  useEffect(() => {
    if (userError || isInternalInterestsError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [isInternalInterestsError, userError, snackbar]);

  return <PersonContext.Provider value={personData}>{children}</PersonContext.Provider>;
};

export default PersonProvider;
