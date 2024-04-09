import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import NewPersonView from 'src/scenes/PeopleRouter/NewPersonView';
import PeopleListView from 'src/scenes/PeopleRouter/PeopleListView';
import PersonDetailsView from 'src/scenes/PeopleRouter/PersonDetailsView';

const PeopleRouter = () => {
  return (
    <Routes>
      <Route path={APP_PATHS.PEOPLE_NEW} element={<NewPersonView />} />
      <Route path={APP_PATHS.PEOPLE_EDIT} element={<NewPersonView />} />
      <Route path={APP_PATHS.PEOPLE_VIEW} element={<PersonDetailsView />} />
      <Route path={APP_PATHS.PEOPLE} element={<PeopleListView />} />
    </Routes>
  );
};

export default PeopleRouter;
