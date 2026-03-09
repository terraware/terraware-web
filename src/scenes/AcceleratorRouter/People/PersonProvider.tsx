import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUserRequest } from 'src/redux/features/user/usersSelectors';
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

  const getUserRequest = useAppSelector(selectUserRequest(userId));
  const getInternalInterestsRequest = useAppSelector(selectUserInternalInterestsGetRequest(userId));

  useEffect(() => {
    if (userId !== -1) {
      void dispatch(requestGetUser(userId));
      void dispatch(requestGetUserInternalInterests(userId));
    }
  }, [dispatch, userId]);

  const personData = useMemo<PersonData>(() => {
    if (
      getUserRequest?.status === 'success' &&
      getInternalInterestsRequest?.status === 'success' &&
      getUserRequest.data?.user
    ) {
      const user = getUserRequest.data.user;
      const internalInterests = getInternalInterestsRequest.data?.internalInterests || [];
      return {
        setUserId,
        user: { ...user, internalInterests },
        userId,
      };
    }
    return { setUserId, userId };
  }, [getInternalInterestsRequest, getUserRequest, userId, setUserId]);

  useEffect(() => {
    if (getUserRequest?.status === 'error' || getInternalInterestsRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getInternalInterestsRequest?.status, getUserRequest?.status, snackbar]);

  return <PersonContext.Provider value={personData}>{children}</PersonContext.Provider>;
};

export default PersonProvider;
