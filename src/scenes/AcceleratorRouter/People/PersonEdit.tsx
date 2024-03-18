import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import {
  requestGetGlobalRolesUser,
  requestUpdateGlobalRolesUser,
} from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import {
  selectGlobalRolesUser,
  selectGlobalRolesUserUpdateRequest,
} from 'src/redux/features/globalRoles/globalRolesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UserWithGlobalRoles } from 'src/types/GlobalRoles';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import PersonForm from './PersonForm';

const PersonEdit = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useStateLocation();
  const snackbar = useSnackbar();
  const pathParams = useParams<{ userId: string }>();
  const userId = Number(pathParams.userId);

  const user = useAppSelector(selectGlobalRolesUser(userId));

  const [saveRequestId, setSaveRequestId] = useState('');
  const saveRequest = useAppSelector(selectGlobalRolesUserUpdateRequest(saveRequestId));

  useEffect(() => {
    void dispatch(requestGetGlobalRolesUser(userId));
  }, [userId, dispatch]);

  const goToViewPerson = useCallback(
    () => history.push(getLocation(APP_PATHS.ACCELERATOR_PERSON.replace(':userId', pathParams.userId), location)),
    [history, location, pathParams.userId]
  );

  const handleOnSave = useCallback(
    (record: UserWithGlobalRoles) => {
      const request = dispatch(requestUpdateGlobalRolesUser({ user: record, globalRoles: record.globalRoles }));
      setSaveRequestId(request.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!saveRequest) {
      return;
    }

    if (saveRequest.status === 'success') {
      goToViewPerson();
    } else if (saveRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [goToViewPerson, saveRequest, snackbar]);

  return (
    <Page title={user?.email || ''} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      {user && (
        <PersonForm
          busy={saveRequest?.status === 'pending'}
          user={user}
          onSave={handleOnSave}
          onCancel={goToViewPerson}
        />
      )}
    </Page>
  );
};

export default PersonEdit;
