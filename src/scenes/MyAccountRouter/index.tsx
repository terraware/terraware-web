import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import MyAccountView from 'src/scenes/MyAccountRouter/MyAccountView';

const MyAccountRouter = () => {
  const { organizations, reloadOrganizations } = useOrganization();

  return (
    <Routes>
      <Route
        path={APP_PATHS.MY_ACCOUNT_EDIT}
        element={<MyAccountView organizations={organizations} edit={true} reloadData={reloadOrganizations} />}
      />
      <Route path={APP_PATHS.MY_ACCOUNT} element={<MyAccountView organizations={organizations} edit={false} />} />
    </Routes>
  );
};

export default MyAccountRouter;
