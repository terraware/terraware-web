import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { useGetUserQuery } from 'src/queries/generated/users';
import { requestGetUserInternalInterests } from 'src/redux/features/userInternalInterests/userInternalInterestsAsyncThunks';
import { selectUserInternalInterestsGetRequest } from 'src/redux/features/userInternalInterests/userInternalInterestsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import { PersonContext, PersonData } from './PersonContext';

export type Props = {
  children: React.ReactNode;
};

const PersonProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const pathParams = useParams<{ userId: string }>();
  const [userId, setUserId] = useState(Number(pathParams.userId || -1));

  const {
    currentData: userData,
    isSuccess: userSuccess,
    isError: userError,
  } = useGetUserQuery(userId, { skip: userId === -1 });
  const getInternalInterestsRequest = useAppSelector(selectUserInternalInterestsGetRequest(userId));

  useEffect(() => {
    if (userId !== -1) {
      void dispatch(requestGetUserInternalInterests(userId));
    }
  }, [dispatch, userId]);

  const personData = useMemo<PersonData>(() => {
    if (userSuccess && getInternalInterestsRequest?.status === 'success' && userData?.user) {
      const user = userData.user;
      const internalInterests = getInternalInterestsRequest.data?.internalInterests || [];
      return {
        setUserId,
        user: { ...user, internalInterests },
        userId,
      };
    }
    return { setUserId, userId };
  }, [getInternalInterestsRequest, userData, userSuccess, userId, setUserId]);

  useEffect(() => {
    if (userError || getInternalInterestsRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getInternalInterestsRequest?.status, userError, snackbar]);

  return <PersonContext.Provider value={personData}>{children}</PersonContext.Provider>;
};

export default PersonProvider;
