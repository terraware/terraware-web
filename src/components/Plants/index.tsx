import { useCallback, useState } from 'react';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import PlantingSiteDetails from './PlantingSiteDetails';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';

export default function PlantsDashboard(): JSX.Element {
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  return (
    <PlantsPrimaryPage
      title={strings.DASHBOARD}
      onSelect={onSelect}
      pagePath={APP_PATHS.PLANTING_SITE_DASHBOARD}
      lastVisitedPreferenceName='plants.dashboard.lastVisitedPlantingSite'
      plantsSitePreferences={plantsDashboardPreferences}
      setPlantsSitePreferences={onPreferences}
    >
      <PlantingSiteDetails
        plantingSite={selectedPlantingSite}
        plantsDashboardPreferences={plantsDashboardPreferences}
        setPlantsDashboardPreferences={(newPreferences) => {
          setPlantsDashboardPreferences((oldPreferences) => ({ ...oldPreferences, ...newPreferences }));
        }}
      />
    </PlantsPrimaryPage>
  );
}
