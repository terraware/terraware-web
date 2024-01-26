import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import MonitoringView from 'src/scenes/MonitoringRouter/MonitoringView';
import { selectedOrgHasFacilityType } from 'src/utils/organization';

const MonitoringRouter = () => {
  const { selectedOrganization, reloadOrganizations } = useOrganization();

  return (
    <Switch>
      <Route exact path={APP_PATHS.MONITORING}>
        <MonitoringView
          hasSeedBanks={selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')}
          reloadData={reloadOrganizations}
        />
      </Route>
      <Route exact path={APP_PATHS.MONITORING_SEED_BANK}>
        <MonitoringView
          hasSeedBanks={selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')}
          reloadData={reloadOrganizations}
        />
      </Route>
    </Switch>
  );
};

export default MonitoringRouter;
