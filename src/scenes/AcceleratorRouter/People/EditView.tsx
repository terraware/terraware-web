import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useAppDispatch } from 'src/redux/store';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import { PersonData, usePersonData } from './PersonContext';
import PersonForm from './PersonForm';

const EditView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useStateLocation();
  const personData = usePersonData();
  const { update, user, userId } = personData;

  const goToViewPerson = useCallback(
    () => navigate(getLocation(APP_PATHS.ACCELERATOR_PERSON.replace(':userId', `${userId}`), location)),
    [navigate, location, userId]
  );

  const handleOnSave = useCallback(
    (record: PersonData) => {
      if (record.user) {
        update(record.user, record.deliverableCategories || [], goToViewPerson);
      }
    },
    [dispatch, goToViewPerson, update]
  );

  return (
    <Page title={user?.email || ''} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      {user && <PersonForm personData={personData} onSave={handleOnSave} onCancel={goToViewPerson} />}
    </Page>
  );
};

export default EditView;
