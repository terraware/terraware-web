import React, { useCallback, useEffect, useState } from 'react';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useSearchUsersQuery } from 'src/queries/generated/users';
import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';
import usePerson from 'src/scenes/AcceleratorRouter/People/usePerson';
import useUpdatePerson from 'src/scenes/AcceleratorRouter/People/useUpdatePerson';
import strings from 'src/strings';
import useDebounce from 'src/utils/useDebounce';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { isTerraformationEmail } from 'src/utils/user';

import PersonForm from './PersonForm';

const NewView = () => {
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const updatePerson = useUpdatePerson();

  const [userId, setUserId] = useState(-1);
  const user = usePerson(userId);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [roleError, setRoleError] = useState('');
  const debouncedEmail = useDebounce(email, 1000);
  const isValidEmail = !!debouncedEmail && isTerraformationEmail(debouncedEmail);
  const { currentData, isFetching, isError } = useSearchUsersQuery(debouncedEmail, { skip: !isValidEmail });

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
        if (currentData?.user) {
          updatePerson.update(record);
        } else {
          void updatePerson.invite(record);
        }
      }
    },
    [currentData?.user, updatePerson]
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
    // Email address must end in @terraformation.com
    if (debouncedEmail && !isTerraformationEmail(debouncedEmail)) {
      setEmailError(strings.EMAIL_REQUIREMENT_TERRAFORMATION);
    }
  }, [debouncedEmail]);

  useEffect(() => {
    if (!isValidEmail || isFetching) {
      return;
    }

    setEmailError('');
    if (currentData?.user) {
      setUserId(currentData.user.id);
    } // else if isError - new user, no op
  }, [currentData, isError, isFetching, isValidEmail, setUserId]);

  useEffect(() => {
    if (updatePerson.succeeded) {
      goToPeople();
    }
  }, [updatePerson, goToPeople]);

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
