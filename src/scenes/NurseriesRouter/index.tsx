import React, { useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';

import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import NurseriesListView from 'src/scenes/NurseriesRouter/NurseriesListView';
import NurseryDetailsView from 'src/scenes/NurseriesRouter/NurseryDetailsView';
import NurseryView from 'src/scenes/NurseriesRouter/NurseryView';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/utils/organization';

const NurseriesRouter = () => {
  const { selectedOrganization } = useOrganization();

  const getNurseriesView = useCallback((): JSX.Element => {
    if (!isPlaceholderOrg(selectedOrganization.id) && selectedOrgHasFacilityType(selectedOrganization, 'Nursery')) {
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
