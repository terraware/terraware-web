import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';

import ContactUsForm from './ContactUsForm';
import ContactUsHome from './ContactUsHome';
import SupportProvider from './provider';

const ContactUsRouter = (): JSX.Element => {
  const featureEnabled = isEnabled('Terraware Support Forms');
  return (
    <SupportProvider>
      <Routes>
        <Route path={'/'} element={<ContactUsHome />} />
        {featureEnabled && <Route path={'/:requestType'} element={<ContactUsForm />} />}
        <Route path={'*'} element={<Navigate to={APP_PATHS.CONTACT_US} />} />
      </Routes>
    </SupportProvider>
  );
};

export default ContactUsRouter;
