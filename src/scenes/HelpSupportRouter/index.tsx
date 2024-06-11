import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';

import ContactUsForm from './ContactUsForm';
import HelpSupportHome from './HelpSupportHome';
import SupportProvider from './provider';

const HelpSupportRouter = (): JSX.Element => {
  const featureEnabled = isEnabled('Terraware Support Forms');
  return (
    <SupportProvider>
      <Routes>
        <Route path={'/'} element={<HelpSupportHome />} />
        {featureEnabled && <Route path={'/:requestType'} element={<ContactUsForm />} />}
        <Route path={'*'} element={<Navigate to={APP_PATHS.HELP_SUPPORT} />} />
      </Routes>
    </SupportProvider>
  );
};

export default HelpSupportRouter;
