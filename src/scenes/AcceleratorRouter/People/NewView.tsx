import React, { useCallback, useEffect, useState } from 'react';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useSearchUsersQuery } from 'src/queries/generated/users';
import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';
import usePerson from 'src/scenes/AcceleratorRouter/People/usePerson';
import useUpdatePerson from 'src/scenes/AcceleratorRouter/People/useUpdatePerson';
import strings from 'src/strings';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { isTerraformationEmail } from 'src/utils/user';

import PersonForm from './PersonForm';

const NewView = () => {
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const updatePerson = useUpdatePerson();

  const [email, setEmail] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [roleError, setRoleError] = useState('');
  const isValidEmail = !!lookupEmail && isTerraformationEmail(lookupEmail) && email === lookupEmail;
  const { currentData, isFetching } = useSearchUsersQuery(lookupEmail, { skip: !isValidEmail });
  const matchingUser = isValidEmail && !isFetching ? currentData?.user : undefined;
  const person = usePerson(matchingUser?.id ?? -1);
  const user = matchingUser && person?.id === matchingUser.id ? person : undefined;
  const lookupBusy = (isValidEmail && isFetching) || (!!matchingUser && !user);

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
      } else if (!isTerraformationEmail(record.email)) {
        setEmailError(strings.EMAIL_REQUIREMENT_TERRAFORMATION);
        noErrors = false;
      }
      if (!record.globalRoles || record.globalRoles.length < 1) {
        setRoleError(strings.REQUIRED_FIELD);
        noErrors = false;
      }
      if (noErrors && record.email === lookupEmail && !lookupBusy) {
        if (matchingUser && !user) {
          return;
        }
        if (user && record.id === user.id) {
          updatePerson.update(record);
        } else {
          void updatePerson.invite(record);
        }
      }
    },
    [lookupEmail, lookupBusy, matchingUser, user, updatePerson]
  );

  const handleOnChange = useCallback(
    (record: UserWithInternalnterests) => {
      const value = record.email || '';
      if (value !== email) {
        setLookupEmail('');
        setEmail(value);
      }
    },
    [email]
  );

  const handleOnEmailBlur = useCallback((value: string) => {
    setLookupEmail(value);
    setEmailError(value && !isTerraformationEmail(value) ? strings.EMAIL_REQUIREMENT_TERRAFORMATION : '');
  }, []);

  useEffect(() => {
    if (updatePerson.succeeded) {
      goToPeople();
    }
  }, [updatePerson, goToPeople]);

  return (
    <Page title={strings.ADD_PERSON} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <PersonForm
        busy={updatePerson.busy}
        saveDisabled={lookupBusy}
        emailEnabled
        emailError={emailError}
        roleError={roleError}
        onSave={handleOnSave}
        onCancel={goToPeople}
        onChange={handleOnChange}
        onEmailBlur={handleOnEmailBlur}
        user={user}
      />
    </Page>
  );
};

export default NewView;
