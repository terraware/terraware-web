import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import PlantingSiteCreate from './PlantingSiteCreate';
import PlantingSitesList from './PlantingSitesList';
import PlantingSiteView from './PlantingSiteView';
import PlantingSiteSubzoneView from './PlantingSiteSubzoneView';
import PlantingSiteZoneView from './PlantingSiteZoneView';

/**
 * This page will route to the correct component based on url params
 */
export type PlantingSitesProps = {
  reloadTracking: () => void;
};

export default function PlantingSites(props: PlantingSitesProps): JSX.Element {
  const [initializingData] = useState<boolean>(false);

  /**
   * TODO: intialize data
   */

  // show spinner while initializing data
  if (initializingData) {
    return <CircularProgress sx={{ margin: 'auto' }} />;
  }

  return <PlantingSitesWrapper {...props} />;
}

const PlantingSitesWrapper = ({ reloadTracking }: PlantingSitesProps): JSX.Element => {
  const trackingV2 = isEnabled('TrackingV2');

  /**
   * TODO: handle the various options
   */

  return (
    <Switch>
      {trackingV2 && (
        <Route path={APP_PATHS.PLANTING_SITES_SUBZONE_VIEW}>
          <PlantingSiteSubzoneView />
        </Route>
      )}
      {trackingV2 && (
        <Route path={APP_PATHS.PLANTING_SITES_ZONE_VIEW}>
          <PlantingSiteZoneView />
        </Route>
      )}
      <Route path={APP_PATHS.PLANTING_SITES_NEW}>
        <PlantingSiteCreate reloadPlantingSites={reloadTracking} />
      </Route>
      <Route path={APP_PATHS.PLANTING_SITES_EDIT}>
        <PlantingSiteCreate reloadPlantingSites={reloadTracking} />
      </Route>
      <Route path={APP_PATHS.PLANTING_SITES_VIEW}>
        <PlantingSiteView />
      </Route>
      <Route path={'*'}>
        <PlantingSitesList />
      </Route>
    </Switch>
  );
};
