import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { useOrganization } from 'src/providers';
import MonitoringView from 'src/scenes/MonitoringRouter/MonitoringView';
import { selectedOrgHasFacilityType } from 'src/utils/organization';

const MonitoringRouter = () => {
  const { selectedOrganization, reloadOrganizations } = useOrganization();

  return (
    <Routes>
      <Route
        path={'*'}
        element={
          <MonitoringView
            hasSeedBanks={selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')}
            reloadData={reloadOrganizations}
          />
        }
      />
      <Route
        path={'/:seedBankId'}
        element={
          <MonitoringView
            hasSeedBanks={selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')}
            reloadData={reloadOrganizations}
          />
        }
      />
    </Routes>
  );
};

export default MonitoringRouter;
