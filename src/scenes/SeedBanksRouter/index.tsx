import React, { useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useOrganization } from 'src/providers';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/utils/organization';
import { APP_PATHS } from 'src/constants';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import SeedBankView from 'src/scenes/SeedBanksRouter/SeedBankView';
import SeedBankDetailsView from 'src/scenes/SeedBanksRouter/SeedBankDetailsView';
import SeedBanksListView from 'src/scenes/SeedBanksRouter/SeedBanksListView';

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
