import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';

import EditView from './EditView';
import ListView from './ListView';
import NewView from './NewView';
import PersonProvider from './PersonProvider';
import SingleView from './SingleView';

const PeopleRouter = () => {
  return (
    <Routes>
      <Route
        path={'new'}
        element={
          <PersonProvider>
            <NewView />
          </PersonProvider>
        }
      />
      <Route
        path={':userId/*'}
        element={
          <PersonProvider>
            <Routes>
              <Route path={''} element={<SingleView />} />
              <Route path={'edit'} element={<EditView />} />
            </Routes>
          </PersonProvider>
        }
      />
      <Route path={''} element={<ListView />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_PEOPLE} />} />
    </Routes>
  );
};

export default PeopleRouter;
