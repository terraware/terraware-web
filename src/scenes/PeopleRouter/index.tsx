import React from 'react';
import { Route, Routes } from 'react-router-dom';

import NewPersonView from 'src/scenes/PeopleRouter/NewPersonView';
import PeopleListView from 'src/scenes/PeopleRouter/PeopleListView';
import PersonDetailsView from 'src/scenes/PeopleRouter/PersonDetailsView';

const PeopleRouter = () => {
  return (
    <Routes>
      <Route path={'/new'} element={<NewPersonView />} />
      <Route path={'/:personId/edit'} element={<NewPersonView />} />
      <Route path={'/:personId'} element={<PersonDetailsView />} />
      <Route path={'/*'} element={<PeopleListView />} />
    </Routes>
  );
};

export default PeopleRouter;
