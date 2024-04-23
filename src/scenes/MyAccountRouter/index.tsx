import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { useOrganization } from 'src/providers';
import MyAccountView from 'src/scenes/MyAccountRouter/MyAccountView';

export interface Props {
  className?: string;
  hasNav?: boolean;
}

const MyAccountRouter = ({ className, hasNav }: Props) => {
  const { organizations, reloadOrganizations } = useOrganization();

  return (
    <Routes>
      <Route
        path={'/edit'}
        element={
          <MyAccountView
            className={className}
            edit={true}
            hasNav={hasNav}
            organizations={organizations}
            reloadData={reloadOrganizations}
          />
        }
      />
      <Route
        path={'/*'}
        element={<MyAccountView className={className} edit={false} hasNav={hasNav} organizations={organizations} />}
      />
    </Routes>
  );
};

export default MyAccountRouter;
