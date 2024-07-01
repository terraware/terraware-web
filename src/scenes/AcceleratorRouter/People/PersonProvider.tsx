import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUserRequest } from 'src/redux/features/user/usersSelectors';
import { requestGetUserDeliverableCategories } from 'src/redux/features/userDeliverableCategories/userDeliverableCategoriesAsyncThunks';
import { selectUserDeliverableCategoriesGetRequest } from 'src/redux/features/userDeliverableCategories/userDeliverableCategoriesSelectors';
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
  const getCategoriesRequest = useAppSelector(selectUserDeliverableCategoriesGetRequest(userId));

  useEffect(() => {
    if (userId !== -1) {
      void dispatch(requestGetUser(userId));
      void dispatch(requestGetUserDeliverableCategories(userId));
    }
  }, [dispatch, userId]);

  const [personData, setPersonData] = useState<PersonData>({ setUserId, userId });

  useEffect(() => {
    if (!getUserRequest || !getCategoriesRequest) {
      return;
    }

    if (getUserRequest.status === 'success' && getCategoriesRequest.status === 'success') {
      const user = getUserRequest.data?.user;
      const deliverableCategories = getCategoriesRequest.data?.deliverableCategories || [];

      if (user) {
        setPersonData({
          setUserId,
          user: { ...user, deliverableCategories },
          userId,
        });
      }
    } else if (getUserRequest.status === 'error' || getCategoriesRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getCategoriesRequest, getUserRequest, userId, snackbar]);

  return <PersonContext.Provider value={personData}>{children}</PersonContext.Provider>;
};

export default PersonProvider;
