import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';
import useUpdatePerson from 'src/scenes/AcceleratorRouter/People/useUpdatePerson';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import PersonForm from './PersonForm';
import usePerson from './usePerson';

const EditView = () => {
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const updatePerson = useUpdatePerson();
  const pathParams = useParams<{ userId: string }>();
  const [userId] = useState(Number(pathParams.userId || -1));
  const user = usePerson(userId);

  const goToViewPerson = useCallback(
    () => navigate(getLocation(APP_PATHS.ACCELERATOR_PERSON.replace(':userId', `${userId}`), location)),
    [navigate, location, userId]
  );

  const handleOnSave = useCallback(
    (record: UserWithInternalnterests) => {
      updatePerson.update(record);
    },
    [updatePerson]
  );

  useEffect(() => {
    if (updatePerson.succeeded) {
      goToViewPerson();
    }
  }, [updatePerson, goToViewPerson]);

  return (
    <Page title={user?.email || ''} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      {user && <PersonForm busy={updatePerson.busy} onSave={handleOnSave} onCancel={goToViewPerson} user={user} />}
    </Page>
  );
};

export default EditView;
