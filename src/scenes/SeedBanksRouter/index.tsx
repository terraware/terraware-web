import React, { type JSX, useCallback } from 'react';
import { Route, Routes } from 'react-router';

import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { useOrganization } from 'src/providers';
import SeedBankDetailsView from 'src/scenes/SeedBanksRouter/SeedBankDetailsView';
import SeedBankView from 'src/scenes/SeedBanksRouter/SeedBankView';
import SeedBanksListView from 'src/scenes/SeedBanksRouter/SeedBanksListView';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/utils/organization';

const SeedBanksRouter = () => {
  const { selectedOrganization } = useOrganization();

  const getSeedBanksView = useCallback((): JSX.Element => {
    if (
      selectedOrganization &&
      !isPlaceholderOrg(selectedOrganization.id) &&
      selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')
    ) {
      return <SeedBanksListView organization={selectedOrganization} />;
    }
    return <EmptyStatePage pageName={'SeedBanks'} />;
  }, [selectedOrganization]);

  return (
    <Routes>
      <Route path={'/new'} element={<SeedBankView />} />
      <Route path={'/:seedBankId'} element={<SeedBankDetailsView />} />
      <Route path={'/:seedBankId/edit'} element={<SeedBankView />} />
      <Route path={'/*'} element={getSeedBanksView()} />
    </Routes>
  );
};

export default SeedBanksRouter;
