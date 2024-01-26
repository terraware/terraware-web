import React, { useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/utils/organization';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import NurseryView from 'src/scenes/NurseriesRouter/NurseryView';
import NurseryDetailsView from 'src/scenes/NurseriesRouter/NurseryDetailsView';
import NurseriesListView from 'src/scenes/NurseriesRouter/NurseriesListView';

const NurseriesRouter = () => {
  const { selectedOrganization } = useOrganization();

  const getNurseriesView = useCallback((): JSX.Element => {
    if (!isPlaceholderOrg(selectedOrganization.id) && selectedOrgHasFacilityType(selectedOrganization, 'Nursery')) {
      return <NurseriesListView organization={selectedOrganization} />;
    }
    return <EmptyStatePage pageName={'Nurseries'} />;
  }, [selectedOrganization]);

  return (
    <Switch>
      <Route exact path={APP_PATHS.NURSERIES_NEW}>
        <NurseryView />
      </Route>
      <Route exact path={APP_PATHS.NURSERIES_EDIT}>
        <NurseryView />
      </Route>
      <Route path={APP_PATHS.NURSERIES_VIEW}>
        <NurseryDetailsView />
      </Route>
      <Route exact path={APP_PATHS.NURSERIES}>
        {getNurseriesView()}
      </Route>
    </Switch>
  );
};

export default NurseriesRouter;
