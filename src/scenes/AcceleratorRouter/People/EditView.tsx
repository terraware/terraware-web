import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { UserWithDeliverableCategories } from 'src/scenes/AcceleratorRouter/People/UserWithDeliverableCategories';
import useUpdatePerson from 'src/scenes/AcceleratorRouter/People/useUpdatePerson';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import { usePersonData } from './PersonContext';
import PersonForm from './PersonForm';

const EditView = () => {
  const navigate = useNavigate();
  const location = useStateLocation();
  const personData = usePersonData();
  const updatePerson = useUpdatePerson();
  const { user, userId } = personData;

  const goToViewPerson = useCallback(
    () => navigate(getLocation(APP_PATHS.ACCELERATOR_PERSON.replace(':userId', `${userId}`), location)),
    [navigate, location, userId]
  );

  const handleOnSave = useCallback(
    (record: UserWithDeliverableCategories) => {
      updatePerson.update(record);
    },
    [updatePerson]
  );

  useEffect(() => {
    if (updatePerson.succeeded) {
      goToViewPerson();
    }
  }, [updatePerson]);

  return (
    <Page title={user?.email || ''} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      {user && <PersonForm busy={updatePerson.busy} onSave={handleOnSave} onCancel={goToViewPerson} user={user} />}
    </Page>
  );
};

export default EditView;
