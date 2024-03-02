import { APP_PATHS } from 'src/constants';
import { searchPlantingSiteSubzones } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';

import GenericZoneView from './GenericZoneView';

export default function PlantingSiteZoneView(): JSX.Element {
  return (
    <GenericZoneView
      siteSelector={selectPlantingSite}
      siteViewPrefix=''
      siteViewUrl={APP_PATHS.PLANTING_SITES_VIEW}
      subzoneViewUrl={APP_PATHS.PLANTING_SITES_SUBZONE_VIEW}
      zoneSelector={searchPlantingSiteSubzones}
    />
  );
}
