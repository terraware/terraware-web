import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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

  const [personData, setPersonData] = useState<PersonData>({ setUserId, userId });

  useEffect(() => {
    if (!getUserRequest || !getInternalInterestsRequest) {
      return;
    }

    if (getUserRequest.status === 'success' && getInternalInterestsRequest.status === 'success') {
      const user = getUserRequest.data?.user;
      const internalInterests = getInternalInterestsRequest.data?.internalInterests || [];

      if (user) {
        setPersonData({
          setUserId,
          user: { ...user, internalInterests },
          userId,
        });
      }
    } else if (getUserRequest.status === 'error' || getInternalInterestsRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getInternalInterestsRequest, getUserRequest, userId, snackbar]);

  return <PersonContext.Provider value={personData}>{children}</PersonContext.Provider>;
};

export default PersonProvider;
