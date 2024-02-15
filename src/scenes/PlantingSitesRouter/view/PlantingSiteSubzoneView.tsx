import { APP_PATHS } from 'src/constants';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { searchPlantingSiteMonitoringPlots } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import GenericSubzoneView from './GenericSubzoneView';

export default function PlantingSiteZoneView(): JSX.Element {
  return (
    <GenericSubzoneView
      siteSelector={selectPlantingSite}
      siteViewPrefix=''
      siteViewUrl={APP_PATHS.PLANTING_SITES_VIEW}
      subzoneSelector={searchPlantingSiteMonitoringPlots}
      zoneViewUrl={APP_PATHS.PLANTING_SITES_ZONE_VIEW}
    />
  );
}
