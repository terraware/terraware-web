import React, { useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';

import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import SeedBankDetailsView from 'src/scenes/SeedBanksRouter/SeedBankDetailsView';
import SeedBankView from 'src/scenes/SeedBanksRouter/SeedBankView';
import SeedBanksListView from 'src/scenes/SeedBanksRouter/SeedBanksListView';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/utils/organization';

const SeedBanksRouter = () => {
  const { selectedOrganization } = useOrganization();

  const getSeedBanksView = useCallback((): JSX.Element => {
    if (!isPlaceholderOrg(selectedOrganization.id) && selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')) {
      return <SeedBanksListView organization={selectedOrganization} />;
    }
    return <EmptyStatePage pageName={'SeedBanks'} />;
  }, [selectedOrganization]);

  return (
    <Switch>
      <Route exact path={APP_PATHS.SEED_BANKS_NEW}>
        <SeedBankView />
      </Route>
      <Route exact path={APP_PATHS.SEED_BANKS_EDIT}>
        <SeedBankView />
      </Route>
      <Route path={APP_PATHS.SEED_BANKS_VIEW}>
        <SeedBankDetailsView />
      </Route>
      <Route exact path={APP_PATHS.SEED_BANKS}>
        {getSeedBanksView()}
      </Route>
    </Switch>
  );
};

export default SeedBanksRouter;
