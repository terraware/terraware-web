import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { requestUpdateGlobalRolesUser } from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import { selectGlobalRolesUserUpdateRequest } from 'src/redux/features/globalRoles/globalRolesSelectors';
import { requestSearchUserByEmail } from 'src/redux/features/user/usersAsyncThunks';
import { selectUserByEmailRequest } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { User } from 'src/types/User';
import useDebounce from 'src/utils/useDebounce';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import PersonForm from './PersonForm';

const NewView = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useStateLocation();
  const snackbar = useSnackbar();

  const [user, setUser] = useState<User>();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const debouncedEmail = useDebounce(email, 250);

  const [searchRequestId, setSearchRequestId] = useState('');
  const searchRequest = useAppSelector(selectUserByEmailRequest(searchRequestId));

  const [saveRequestId, setSaveRequestId] = useState('');
  const saveRequest = useAppSelector(selectGlobalRolesUserUpdateRequest(saveRequestId));

  const goToPeople = useCallback(
    () => history.push(getLocation(APP_PATHS.ACCELERATOR_PEOPLE, location)),
    [history, location]
  );

  const handleOnSave = useCallback(
    (record: User) => {
      const request = dispatch(requestUpdateGlobalRolesUser({ user: record, globalRoles: record.globalRoles }));
      setSaveRequestId(request.requestId);
    },
    [dispatch]
  );

  const handeOnChange = useCallback(
    (record: User) => {
      if (record.email) {
        setEmailError('');
        setEmail(record.email);
      }
    },
    [setEmail]
  );

  useEffect(() => {
    if (!debouncedEmail) {
      return;
    }

    const request = dispatch(requestSearchUserByEmail(debouncedEmail));
    setSearchRequestId(request.requestId);
  }, [debouncedEmail, dispatch]);

  useEffect(() => {
    if (!saveRequest) {
      return;
    }

    if (saveRequest.status === 'success') {
      goToPeople();
    } else if (saveRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [goToPeople, saveRequest, snackbar]);

  useEffect(() => {
    if (!searchRequest) {
      return;
    }

    if (searchRequest.status === 'success' && searchRequest.data?.user) {
      setEmailError('');
      setUser(searchRequest.data?.user);
    } else if (searchRequest.status === 'error') {
      setEmailError(strings.USER_WITH_EMAIL_DOES_NOT_EXIST);
    }
  }, [searchRequest]);

  return (
    <Page title={strings.ADD_PERSON} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <PersonForm
        busy={saveRequest?.status === 'pending'}
        emailEnabled
        emailError={emailError}
        onSave={handleOnSave}
        user={user}
        onCancel={goToPeople}
        onChange={handeOnChange}
      />
    </Page>
  );
};

export default NewView;
