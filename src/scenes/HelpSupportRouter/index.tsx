import React, { type JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';

import ContactUsForm from './ContactUsForm';
import HelpSupportHome from './HelpSupportHome';
import SupportProvider from './provider';

const HelpSupportRouter = (): JSX.Element => {
  return (
    <SupportProvider>
      <Routes>
        <Route path={'/'} element={<HelpSupportHome />} />
        <Route path={'/:requestType'} element={<ContactUsForm />} />
        <Route path={'*'} element={<Navigate to={APP_PATHS.HELP_SUPPORT} />} />
      </Routes>
    </SupportProvider>
  );
};

export default HelpSupportRouter;
