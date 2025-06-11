import React, { useCallback } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import NoOrgApplicationLandingPage from 'src/components/emptyStatePages/NoOrgApplicationLandingPage';
import NoOrgLandingPage from 'src/components/emptyStatePages/NoOrgLandingPage';
import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import HelpSupportRouter from 'src/scenes/HelpSupportRouter';
import MyAccountRouter from 'src/scenes/MyAccountRouter';
import OptInFeaturesView from 'src/scenes/OptInFeatures';
import SettingsPage from 'src/scenes/Settings/SettingsPage';
import useEnvironment from 'src/utils/useEnvironment';

const NoOrgRouter = () => {
  const { isProduction } = useEnvironment();
  const { reloadUserPreferences: reloadPreferences } = useUser();

  const optInRefresh = useCallback(() => void reloadPreferences(), [reloadPreferences]);

  return (
    <Routes>
      <Route path={`${APP_PATHS.MY_ACCOUNT}/*`} element={<MyAccountRouter hasNav={false} />} />
      <Route path={APP_PATHS.SETTINGS} element={<SettingsPage />} />
      <Route path={APP_PATHS.WELCOME} element={<NoOrgLandingPage />} />
      <Route path={`${APP_PATHS.APPLICATIONS}/*`} element={<NoOrgApplicationLandingPage />} />
      {!isProduction && <Route path={APP_PATHS.OPT_IN} element={<OptInFeaturesView refresh={optInRefresh} />} />}
      <Route path={`${APP_PATHS.HELP_SUPPORT}/*`} element={<HelpSupportRouter />} />
      <Route path={`${APP_PATHS.HOME}/*`} element={<NoOrgLandingPage />} />
      <Route path='*' element={<Navigate to={APP_PATHS.WELCOME} />} />
    </Routes>
  );
};

export default NoOrgRouter;
