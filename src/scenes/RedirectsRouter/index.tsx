import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

const RedirectsRouter = () => {
  return (
    <Routes>
      {/* Redirects. Invalid paths will redirect to the closest valid path. */}
      {/* In alphabetical order for easy reference with APP_PATHS, except for /home which must go last */}
      <Route path={APP_PATHS.ACCESSIONS + '/'} element={<Navigate to={APP_PATHS.ACCESSIONS} />} />
      <Route path={APP_PATHS.CHECKIN + '/'} element={<Navigate to={APP_PATHS.CHECKIN} />} />
      <Route path={APP_PATHS.CONTACT_US + '/'} element={<Navigate to={APP_PATHS.CONTACT_US} />} />
      <Route path={APP_PATHS.ORGANIZATION + '/'} element={<Navigate to={APP_PATHS.ORGANIZATION} />} />
      <Route path={APP_PATHS.PEOPLE + '/'} element={<Navigate to={APP_PATHS.PEOPLE} />} />
      <Route path={APP_PATHS.PROJECTS + '/'} element={<Navigate to={APP_PATHS.PROJECTS} />} />
      <Route path={APP_PATHS.SEEDS_DASHBOARD + '/'} element={<Navigate to={APP_PATHS.SEEDS_DASHBOARD} />} />
      <Route path={APP_PATHS.SPECIES + '/'} element={<Navigate to={APP_PATHS.SPECIES} />} />
      <Route path='*' element={<Navigate to={APP_PATHS.HOME} />} />
    </Routes>
  );
};

export default RedirectsRouter;
