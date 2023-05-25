import { useCallback, useState } from 'react';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';

export default function PlantsDashboard(): JSX.Element {
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsSitePreferences(preferences),
    [setPlantsSitePreferences]
  );

  return (
    <PlantsPrimaryPage
      title={strings.OBSERVATIONS}
      onSelect={onSelect}
      pagePath={APP_PATHS.PLANTING_SITE_OBSERVATIONS}
      lastVisitedPreferenceName='lastObservationsPlantingSite'
      plantsSitePreferences={plantsSitePreferences}
      setPlantsSitePreferences={onPreferences}
      allowAllAsSiteSelection={true}
    >
      <div>placeholder for selected planting site {selectedPlantingSite?.id}</div>
    </PlantsPrimaryPage>
  );
}
