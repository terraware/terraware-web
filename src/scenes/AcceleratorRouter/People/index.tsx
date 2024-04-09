import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import EditView from './EditView';
import ListView from './ListView';
import NewView from './NewView';
import PersonProvider from './PersonProvider';
import SingleView from './SingleView';

const PeopleRouter = () => {
  return (
    <Routes>
      <Route path={APP_PATHS.ACCELERATOR_PEOPLE} element={<ListView />} />
      <Route path={APP_PATHS.ACCELERATOR_PERSON_NEW} element={<NewView />} />
      <Route
        path={APP_PATHS.ACCELERATOR_PERSON}
        element={
          <PersonProvider>
            <Routes>
              <Route path={APP_PATHS.ACCELERATOR_PERSON} element={<SingleView />} />
              <Route path={APP_PATHS.ACCELERATOR_PERSON_EDIT} element={<EditView />} />
            </Routes>
          </PersonProvider>
        }
      />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_PEOPLE} />} />
    </Routes>
  );
};

export default PeopleRouter;
