import React, { type JSX, useCallback } from 'react';
import { Route, Routes } from 'react-router';

import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { useOrganization } from 'src/providers';
import NurseriesListView from 'src/scenes/NurseriesRouter/NurseriesListView';
import NurseryDetailsView from 'src/scenes/NurseriesRouter/NurseryDetailsView';
import NurseryView from 'src/scenes/NurseriesRouter/NurseryView';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/utils/organization';

const NurseriesRouter = () => {
  const { selectedOrganization } = useOrganization();

  const getNurseriesView = useCallback((): JSX.Element => {
    if (
      selectedOrganization &&
      !isPlaceholderOrg(selectedOrganization.id) &&
      selectedOrgHasFacilityType(selectedOrganization, 'Nursery')
    ) {
      return <NurseriesListView organization={selectedOrganization} />;
    }
    return <EmptyStatePage pageName={'Nurseries'} />;
  }, [selectedOrganization]);

  return (
    <Routes>
      <Route path={'/new'} element={<NurseryView />} />
      <Route path={'/:nurseryId/edit'} element={<NurseryView />} />
      <Route path={'/:nurseryId'} element={<NurseryDetailsView />} />
      <Route path={'/*'} element={getNurseriesView()} />
    </Routes>
  );
};

export default NurseriesRouter;
