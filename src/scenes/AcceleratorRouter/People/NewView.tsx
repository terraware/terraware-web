import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { requestSearchUserByEmail } from 'src/redux/features/user/usersAsyncThunks';
import { selectUserByEmailRequest } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { PersonData, usePersonData } from 'src/scenes/AcceleratorRouter/People/PersonContext';
import strings from 'src/strings';
import useDebounce from 'src/utils/useDebounce';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { isTerraformationEmail } from 'src/utils/user';

import PersonForm from './PersonForm';

const NewView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useStateLocation();

  const personData = usePersonData();
  const { setUserId, update } = personData;
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const debouncedEmail = useDebounce(email, 1000);

  const [searchRequestId, setSearchRequestId] = useState('');
  const searchRequest = useAppSelector(selectUserByEmailRequest(searchRequestId));

  const goToPeople = useCallback(
    () => navigate(getLocation(APP_PATHS.ACCELERATOR_PEOPLE, location)),
    [navigate, location]
  );

  const handleOnSave = useCallback(
    (record: PersonData) => {
      if (record.user) {
        update(record.user, record.deliverableCategories || [], goToPeople);
      }
    },
    [goToPeople, update]
  );

  const handleOnChange = useCallback(
    (personData: PersonData) => {
      if (personData.user?.email) {
        setEmailError('');
        setEmail(personData.user.email);
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

  return (
    <Page title={strings.ADD_PERSON} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <PersonForm
        emailEnabled
        emailError={emailError}
        onSave={handleOnSave}
        personData={personData}
        onCancel={goToPeople}
        onChange={handleOnChange}
      />
    </Page>
  );
};

export default NewView;
