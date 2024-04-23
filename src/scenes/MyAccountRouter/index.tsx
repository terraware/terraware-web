import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { useOrganization } from 'src/providers';
import MyAccountView from 'src/scenes/MyAccountRouter/MyAccountView';

const MyAccountRouter = () => {
  const { organizations, reloadOrganizations } = useOrganization();

  return (
    <Routes>
      <Route
        path={'/edit'}
        element={<MyAccountView organizations={organizations} edit={true} reloadData={reloadOrganizations} />}
      />
      <Route path={'/*'} element={<MyAccountView organizations={organizations} edit={false} />} />
    </Routes>
  );
};

export default MyAccountRouter;
