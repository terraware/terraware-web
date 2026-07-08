import React, { type JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';

import ContactUsForm from './ContactUsForm';
import HelpSupportHome from './HelpSupportHome';

const HelpSupportRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/'} element={<HelpSupportHome />} />
      <Route path={'/:requestType'} element={<ContactUsForm />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.HELP_SUPPORT} />} />
    </Routes>
  );
};

export default HelpSupportRouter;
