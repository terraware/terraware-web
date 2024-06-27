import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { requestUpdateGlobalRolesUser } from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import { selectGlobalRolesUserUpdateRequest } from 'src/redux/features/globalRoles/globalRolesSelectors';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUserRequest } from 'src/redux/features/user/usersSelectors';
import {
  requestGetUserDeliverableCategories,
  requestUpdateUserDeliverableCategories,
} from 'src/redux/features/userDeliverableCategories/userDeliverableCategoriesAsyncThunks';
import {
  selectUserDeliverableCategoriesGetRequest,
  selectUserDeliverableCategoriesUpdateRequest,
} from 'src/redux/features/userDeliverableCategories/userDeliverableCategoriesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DeliverableCategoryType } from 'src/types/Deliverables';
import { User } from 'src/types/User';
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
  const [getCategoriesRequestId, setGetCategoriesRequestId] = useState('');
  const getCategoriesRequest = useAppSelector(selectUserDeliverableCategoriesGetRequest(getCategoriesRequestId));

  const [updateGlobalRolesRequestId, setUpdateGlobalRolesRequestId] = useState('');
  const updateGlobalRolesRequest = useAppSelector(selectGlobalRolesUserUpdateRequest(updateGlobalRolesRequestId));
  const [updateCategoriesRequestId, setUpdateCategoriesRequestId] = useState('');
  const updateCategoriesRequest = useAppSelector(
    selectUserDeliverableCategoriesUpdateRequest(updateCategoriesRequestId)
  );
  const [onUpdateSuccess, setOnUpdateSuccess] = useState<() => void>();

  const reloadCategories = useCallback(() => {
    if (userId !== -1) {
      const getCategoriesRequest = dispatch(requestGetUserDeliverableCategories(userId));
      setGetCategoriesRequestId(getCategoriesRequest.requestId);
    }
  }, [dispatch, userId]);

  const reloadUser = useCallback(() => {
    if (userId !== -1) {
      void dispatch(requestGetUser(userId));
    }
  }, [dispatch, userId]);

  const reload = useCallback(() => {
    console.log(userId);
    reloadCategories();
    reloadUser();
  }, [reloadCategories, reloadUser]);

  const update = useCallback((user: User, deliverableCategories: DeliverableCategoryType[], onSuccess: () => void) => {
    setOnUpdateSuccess(onSuccess);

    const categoriesRequest = dispatch(
      requestUpdateUserDeliverableCategories({
        user: user,
        deliverableCategories: deliverableCategories,
      })
    );

    setUpdateCategoriesRequestId(categoriesRequest.requestId);

    const globalRolesRequest = dispatch(
      requestUpdateGlobalRolesUser({
        user: user,
        globalRoles: user.globalRoles,
      })
    );

    setUpdateGlobalRolesRequestId(globalRolesRequest.requestId);
  }, []);

  const [personData, setPersonData] = useState<PersonData>({ setUserId, update, userId });

  useEffect(() => {
    if (!getUserRequest || !getCategoriesRequest) {
      return;
    }

    if (getUserRequest.status === 'success' && getCategoriesRequest.status === 'success') {
      const user = getUserRequest.data?.user;
      const deliverableCategories = getCategoriesRequest.data?.deliverableCategories;

      setPersonData({
        deliverableCategories,
        isBusy: updateCategoriesRequest?.status === 'pending' || updateGlobalRolesRequest?.status === 'pending',
        setUserId,
        update,
        user,
        userId,
      });
    } else if (getUserRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getCategoriesRequest, getUserRequest, updateCategoriesRequest, updateGlobalRolesRequest, userId, snackbar]);

  useEffect(() => {
    if (updateCategoriesRequest?.status === 'success') {
      reloadCategories();
    } else if (updateCategoriesRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [reloadCategories, snackbar, updateCategoriesRequest]);

  useEffect(() => {
    if (updateGlobalRolesRequest?.status === 'success') {
      reloadUser();
    } else if (updateGlobalRolesRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [reloadUser, snackbar, updateGlobalRolesRequest]);

  useEffect(() => {
    if (
      updateCategoriesRequest?.status === 'success' &&
      updateGlobalRolesRequest?.status === 'success' &&
      onUpdateSuccess
    ) {
      onUpdateSuccess();
    }
  }, [onUpdateSuccess, updateCategoriesRequest, updateGlobalRolesRequest]);

  useEffect(() => reload(), [reload]);

  return <PersonContext.Provider value={personData}>{children}</PersonContext.Provider>;
};

export default PersonProvider;
