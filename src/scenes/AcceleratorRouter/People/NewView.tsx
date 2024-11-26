import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { requestSearchUserByEmail } from 'src/redux/features/user/usersAsyncThunks';
import { selectUserByEmailRequest } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { usePersonData } from 'src/scenes/AcceleratorRouter/People/PersonContext';
import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';
import useUpdatePerson from 'src/scenes/AcceleratorRouter/People/useUpdatePerson';
import strings from 'src/strings';
import useDebounce from 'src/utils/useDebounce';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { isTerraformationEmail } from 'src/utils/user';

import PersonForm from './PersonForm';

const NewView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useStateLocation();
  const updatePerson = useUpdatePerson();

  const personData = usePersonData();
  const { setUserId, user } = personData;
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [roleError, setRoleError] = useState('');
  const debouncedEmail = useDebounce(email, 1000);
  const [searchRequestId, setSearchRequestId] = useState('');
  const searchRequest = useAppSelector(selectUserByEmailRequest(searchRequestId));

  const goToPeople = useCallback(
    () => navigate(getLocation(APP_PATHS.ACCELERATOR_PEOPLE, location)),
    [navigate, location]
  );

  const handleOnSave = useCallback(
    (record: UserWithInternalnterests) => {
      let noErrors = true;
      if (!record.email) {
        setEmailError(strings.REQUIRED_FIELD);
        noErrors = false;
      }
      if (!record.globalRoles || record.globalRoles.length < 1) {
        setRoleError(strings.REQUIRED_FIELD);
        noErrors = false;
      }
      if (noErrors) {
        updatePerson.update(record);
      }
    },
    [updatePerson]
  );

  const handleOnChange = useCallback(
    (record: UserWithInternalnterests) => {
      if (record.email) {
        setEmail(record.email);
      }
    },
    [setEmail]
  );

  useEffect(() => {
    if (!debouncedEmail) {
      return;
    }

    // Email address must end in @terraformation.com
    if (!isTerraformationEmail(debouncedEmail)) {
      setEmailError(strings.EMAIL_REQUIREMENT_TERRAFORMATION);
      return;
    }

    const request = dispatch(requestSearchUserByEmail(debouncedEmail));
    setSearchRequestId(request.requestId);
  }, [debouncedEmail, dispatch]);

  useEffect(() => {
    if (!searchRequest) {
      return;
    }

    if (searchRequest.status === 'success' && searchRequest.data?.user) {
      setEmailError('');
      setUserId(searchRequest.data.user.id);
    } else if (searchRequest.status === 'error') {
      setEmailError(strings.USER_WITH_EMAIL_DOES_NOT_EXIST);
    }
  }, [searchRequest]);

  useEffect(() => {
    if (updatePerson.succeeded) {
      goToPeople();
    }
  }, [updatePerson]);

  return (
    <Page title={strings.ADD_PERSON} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <PersonForm
        busy={updatePerson.busy}
        emailEnabled
        emailError={emailError}
        roleError={roleError}
        onSave={handleOnSave}
        onCancel={goToPeople}
        onChange={handleOnChange}
        user={user}
      />
    </Page>
  );
};

export default NewView;
