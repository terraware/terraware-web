import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { FacilityType } from 'src/types/Facility';
import { defaultSelectedOrg } from 'src/providers/contexts';
import MonitoringView from 'src/scenes/MonitoringRouter/MonitoringView';

const MonitoringRouter = () => {
  const { selectedOrganization, reloadOrganizations } = useOrganization();

  // These will both be removed once #2050 is merged in
  const isPlaceholderOrg = (id: number) => id === defaultSelectedOrg.id;
  const selectedOrgHasFacilityType = (facilityType: FacilityType): boolean => {
    if (!isPlaceholderOrg(selectedOrganization.id) && selectedOrganization.facilities) {
      return selectedOrganization.facilities.some((facility: any) => {
        return facility.type === facilityType;
      });
    } else {
      return false;
    }
  };

  return (
    <Switch>
      <Route exact path={APP_PATHS.MONITORING}>
        <MonitoringView hasSeedBanks={selectedOrgHasFacilityType('Seed Bank')} reloadData={reloadOrganizations} />
      </Route>
      <Route exact path={APP_PATHS.MONITORING_SEED_BANK}>
        <MonitoringView hasSeedBanks={selectedOrgHasFacilityType('Seed Bank')} reloadData={reloadOrganizations} />
      </Route>
    </Switch>
  );
};

export default MonitoringRouter;
