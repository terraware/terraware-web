import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import NoOrgLandingPage from 'src/components/emptyStatePages/NoOrgLandingPage';
import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import MyAccountRouter from 'src/scenes/MyAccountRouter';
import OptInFeaturesView from 'src/scenes/OptInFeatures';
import useEnvironment from 'src/utils/useEnvironment';

const NoOrgRouter = () => {
  const { isProduction } = useEnvironment();
  const { reloadUserPreferences: reloadPreferences } = useUser();

  return (
    <Routes>
      <Route path={`${APP_PATHS.MY_ACCOUNT}/*`} element={<MyAccountRouter hasNav={false} />} />
      <Route path={APP_PATHS.WELCOME} element={<NoOrgLandingPage />} />
      {!isProduction && <Route path={APP_PATHS.OPT_IN} element={<OptInFeaturesView refresh={reloadPreferences} />} />}
      <Route path='*' element={<Navigate to={APP_PATHS.WELCOME} />} />
    </Routes>
  );
};

export default NoOrgRouter;
