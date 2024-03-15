import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { requestUpdateGlobalRolesUser } from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import { selectGlobalRolesUserUpdateRequest } from 'src/redux/features/globalRoles/globalRolesSelectors';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UserWithGlobalRoles } from 'src/types/GlobalRoles';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import { usePersonData } from './PersonContext';
import PersonForm from './PersonForm';

const EditView = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useStateLocation();
  const snackbar = useSnackbar();
  const { user, userId } = usePersonData();

  const [saveRequestId, setSaveRequestId] = useState('');
  const saveRequest = useAppSelector(selectGlobalRolesUserUpdateRequest(saveRequestId));

  const goToViewPerson = useCallback(
    () => history.push(getLocation(APP_PATHS.ACCELERATOR_PERSON.replace(':userId', `${userId}`), location)),
    [history, location, userId]
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
      void dispatch(requestGetUser(userId));
      goToViewPerson();
    } else if (saveRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [dispatch, goToViewPerson, saveRequest, snackbar, userId]);

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

export default EditView;
